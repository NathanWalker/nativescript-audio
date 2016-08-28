import * as app from 'application';
import {TNSRecordI} from '../common';
import {AudioRecorderOptions} from '../options';

declare var android, Thread;
let PackageManager = android.content.pm.PackageManager;
let AudioFormat = android.media.AudioFormat;
let AudioRecord = android.media.AudioRecord;
let MediaRecorder = android.media.MediaRecorder;
let GLSurfaceView = android.opengl.GLSurfaceView;
let Handler = android.os.Handler;
let Looper = android.os.Looper;

export class TNSRecorder implements TNSRecordI {
  public static RECORDER_SAMPLE_RATE: number = 44100;
  public static RECORDER_CHANNELS: number = 1;
  public static RECORDER_ENCODING_BIT: number = 16;
  public static RECORDER_AUDIO_ENCODING: any = AudioFormat.ENCODING_PCM_16BIT;
  public static MAX_DECIBELS = 120;
  
  private _recorder: any;
  private _audioRecord: any;
  private _recordingThread: any;
  private _recordPositionUpdateListener: any;
  private _buffer: any;

  public static CAN_RECORD(): boolean {
    var pManager = app.android.context.getPackageManager();
    var canRecord = pManager.hasSystemFeature(PackageManager.FEATURE_MICROPHONE);
    if (canRecord) {
      return true;
    } else {
      return false;
    }
  }

  public start(options: AudioRecorderOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (options.metering) {
          this.initMetering();
        }

        if (this._audioRecord.getState() == AudioRecord.STATE_INITIALIZED) {
          this._audioRecord.startRecording();
          // this._recordingThread.start();
          resolve();
        }     

        // this._recorder = new MediaRecorder();

        // this._recorder.setAudioSource(0);
        // this._recorder.setOutputFormat(0);
        // this._recorder.setAudioEncoder(0);
        // // this._recorder.setOutputFile("/sdcard/example.mp4");
        // this._recorder.setOutputFile(options.filename);
        

        // // Is there any benefit to calling start() before setting listener?

        // // On Error
        // this._recorder.setOnErrorListener(new MediaRecorder.OnErrorListener({
        //   onError: (mr: any, what: number, extra: number) => {
        //     options.errorCallback({ msg: what, extra: extra });
        //   }
        // }));

        // // On Info
        // this._recorder.setOnInfoListener(new MediaRecorder.OnInfoListener({
        //   onInfo: (mr: any, what: number, extra: number) => {
        //     options.infoCallback({ msg: what, extra: extra });
        //   }
        // }));

        // this._recorder.prepare();
        // this._recorder.start();        

        // resolve();

      } catch (ex) {
        reject(ex);
      }
    });
  }

  public stop(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (this._audioRecord != null) {
          this._audioRecord.release();
        }

        // this._recorder.stop();
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  public dispose(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (this._audioRecord != null) {
          this._audioRecord.release();
          this._audioRecord = undefined;
        }
        // this._recorder.release();
        // this._recorder = undefined;
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  private initMetering() {
    this._recordPositionUpdateListener = new AudioRecord.OnRecordPositionUpdateListener({
      onMarkerReached: () => {

      },
      onPeriodicNotification: (recorder) => {
        if (this._audioRecord.getRecordingState() == AudioRecord.RECORDSTATE_RECORDING
          && this._audioRecord.read(this._buffer, 0, this._buffer.length) != -1) {
          console.log(this._buffer);
            // mHorizon.updateView(buffer);
        }
      }
    });

    let bufferSize = 2 * AudioRecord.getMinBufferSize(TNSRecorder.RECORDER_SAMPLE_RATE,
                TNSRecorder.RECORDER_CHANNELS, TNSRecorder.RECORDER_AUDIO_ENCODING);
    this._audioRecord = new AudioRecord(0, TNSRecorder.RECORDER_SAMPLE_RATE,
                TNSRecorder.RECORDER_CHANNELS, TNSRecorder.RECORDER_AUDIO_ENCODING, bufferSize);
    // AudioUtil.initProcessor(TNSRecorder.RECORDER_SAMPLE_RATE, TNSRecorder.RECORDER_CHANNELS, TNSRecorder.RECORDER_ENCODING_BIT);

    // this._recordingThread = new java.lang.Thread({
    //   run: () => {
        // super.run();
        this._buffer = [bufferSize];
        // Looper.prepare();
        // this._audioRecord.setRecordPositionUpdateListener(this._recordPositionUpdateListener, new Handler(Looper.myLooper()));
        this._audioRecord.setRecordPositionUpdateListener(this._recordPositionUpdateListener);
        let bytePerSample = TNSRecorder.RECORDER_ENCODING_BIT / 8;
        let samplesToDraw = bufferSize / bytePerSample;
        this._audioRecord.setPositionNotificationPeriod(samplesToDraw);
        //We need to read first chunk to motivate recordPositionUpdateListener.
        //Mostly, for lower versions - https://code.google.com/p/android/issues/detail?id=53996
        this._audioRecord.read(this._buffer, 0, bufferSize);
    //     Looper.loop();
    //   }
    // });
  }
}
