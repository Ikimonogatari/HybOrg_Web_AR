import React, { useEffect, useRef, useState } from "react";
import { CameraKitSession } from "@snap/camera-kit";
import { bootstrapCameraKit } from "@snap/camera-kit";
import { Lens } from "@snap/camera-kit";
import { Transform2D } from "@snap/camera-kit";
import { createMediaStreamSource } from "@snap/camera-kit";
import "./CameraKit.css";

let video;
const CameraKit = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [recording, setRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust the threshold as per your needs
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const canvasRef = useRef(null);
  // camera kit api staging ashiglav
  const CameraKitApi =
    "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjg1NDI3NzE0LCJzdWIiOiIzNTAwZDQ3ZC1jNjQ5LTQ3OWYtYWQ5ZS0wNDMwODI4YTY1MmV-U1RBR0lOR340MDQwNmVlNC1mNTNhLTRkNTctOTljYi1iYTAyNzVjYjFjNTgifQ.gWIa_Mi5qJP0ZoOhBOo_p1eobtcuw17EQPLXoCT--c4";
  const lensGroupId = "fadde968-b380-4bcf-a006-10de7fcd75fa";
  const DeviceCameraType = useRef(null);
  const SnapLenses = useRef(null);
  useEffect(() => {
    const init = async () => {
      const cameraKit = await bootstrapCameraKit({ apiToken: CameraKitApi });
      const session = await cameraKit.createSession();
      const canvas = canvasRef.current;
      if (canvas) canvas.replaceWith(session.output.live);
      const { lenses } = await cameraKit.lenses.repository.loadLensGroups([
        lensGroupId,
      ]);
      session.applyLens(lenses[19]);

      await setCameraKitSource(session);
      await attachCamerasToSelect(session);
      await attachLensesToSelect(lenses, session);
    };
    init();
  }, []);
  // camera kit device camera duudah function
  const setCameraKitSource = async (session, deviceId) => {
    if (video) {
      session.pause();
      video.getVideoTracks()[0].stop();
    }
    if (isMobile) {
      video = await navigator.mediaDevices.getUserMedia({
        video: {
          audio: true,
          facingMode: "user",
        },
      });
    } else {
      video = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 1280, height: 720 },
      });
    }
    const source = createMediaStreamSource(video);
    await session.setSource(source);
    source.setTransform(Transform2D.MirrorX);
    session.play();
  };
  //camera songoh function
  const attachCamerasToSelect = async (session) => {
    DeviceCameraType.current.innerHTML = "";
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(({ kind }) => kind === "videoinput");
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.text = camera.label;
      DeviceCameraType.current.appendChild(option);
    });
    DeviceCameraType.current.addEventListener("change", (event) => {
      const deviceId = event.target.selectedOptions[0].value;
      setCameraKitSource(session, deviceId);
    });
  };
  // snapchat lens songoh function
  const attachLensesToSelect = async (lenses, session) => {
    SnapLenses.current.innerHTML = "";
    lenses.forEach((lens) => {
      const option = document.createElement("option");
      option.value = lens.id;
      option.text = lens.name;
      SnapLenses.current.appendChild(option);
    });
    SnapLenses.current.addEventListener("change", (event) => {
      const lensId = event.target.selectedOptions[0].value;
      const lens = lenses.find((lens) => lens.id === lensId);
      if (lens) session.applyLens(lens);
    });
  };
  useEffect(() => {
    const startRecording = () => {
      const canvas = canvasRef.current;
      const stream = canvas.captureStream();
      const mimeType = "video/webm";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.onstop = handleStop;
      mediaRecorder.start();
      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };

    const handleDataAvailable = (event) => {
      chunksRef.current.push(event.data);
    };

    const handleStop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      videoRef.current.src = url;
      setRecording(false);
    };

    const recordButton = document.getElementById("record-button");
    const stopButton = document.getElementById("stop-button");

    recordButton.addEventListener("click", startRecording);
    stopButton.addEventListener("click", stopRecording);

    return () => {
      recordButton.removeEventListener("click", startRecording);
      stopButton.removeEventListener("click", stopRecording);
    };
  }, []);

  return (
    <>
      <div className='h-screen sm:h-full w-full mx-auto bg-[#0e0e0e] sm:bg-inherit container px-7 mt-0 sm:mt-[200px]'>
        <div className='flex flex-col justify-center items-center'>
          <canvas ref={canvasRef} className='w-screen h-screen'></canvas>
          <video controls ref={videoRef} />
          <img
            src='cameraLogo.png'
            style={{
              position: "absolute",
              top: 100,
              height: "40px",
            }}
            className='logo'
          />
          <div className='bg-transparent flex flex-col gap-3 absolute bottom-50% right-10 sm:static sm:mt-10'>
            <div className='px-2 sm:px-4 py-2 flex items-center gap-1 w-2/3 sm:w-auto  rounded-3xl bg-[#CD515266] text-white'>
              <img src='virtual.png' className='w-6 h-6 bg-transparent' />
              <select
                ref={DeviceCameraType}
                className='appearance-none\ bg-transparent text-[10px] text-white'></select>
            </div>
            <button id='record-button'>
              <img src='button.png' className='bg-transparent' />
            </button>
            <button id='stop-button'>stop</button>
            <div className='px-2 sm:px-4 py-2 flex items-center gap-1 w-1/2 sm:w-auto rounded-3xl bg-[#CD515266] text-white'>
              <img src='camera.png' className='w-6 h-6 bg-transparent' />
              <select
                ref={SnapLenses}
                className='appearance-none bg-transparent text-[10px] text-white'></select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CameraKit;
