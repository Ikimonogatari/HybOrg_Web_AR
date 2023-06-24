import React, { useEffect, useRef } from "react";
import { CameraKitSession } from "@snap/camera-kit";
import { bootstrapCameraKit } from "@snap/camera-kit";
import { Lens } from "@snap/camera-kit";
import { Transform2D } from "@snap/camera-kit";
import { createMediaStreamSource } from "@snap/camera-kit";
import "./CameraKit.css";

let video;
const CameraKit = () => {
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
    video = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
    });
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
  return (
    <>
      <div className='h-screen sm:h-full w-full mx-auto bg-[#0e0e0e] sm:bg-inherit container px-7 mt-0 sm:mt-[200px]'>
        <div className='flex flex-col justify-center items-center'>
          <canvas ref={canvasRef} className='w-screen h-screen'></canvas>
          <img
            src='cameraLogo.png'
            style={{
              position: "absolute",
              top: 100,
              height: "40px",
            }}
            className='logo'
          />
          <div className='bg-transparent flex gap-3 absolute bottom-20 sm:static sm:mt-10'>
            <div className='px-2 sm:px-4 py-2 flex items-center gap-1 w-2/3 sm:w-auto  rounded-3xl bg-[#CD515266] text-white'>
              <img src='virtual.png' className='w-6 h-6 bg-transparent' />
              <select
                ref={DeviceCameraType}
                className='appearance-none\ bg-transparent text-[10px] text-white'></select>
            </div>
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
