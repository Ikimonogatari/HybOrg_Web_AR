import React, { useEffect, useRef } from "react";
import { CameraKitSession } from "@snap/camera-kit";
import { bootstrapCameraKit } from "@snap/camera-kit";
import { Lens } from "@snap/camera-kit";
import { Transform2D } from "@snap/camera-kit";
import { createMediaStreamSource } from "@snap/camera-kit";
import "./CameraKit.css";
import { wait } from "@testing-library/user-event/dist/utils";

let video;
const SnapCamera = () => {
  const canvasRef = useRef(null);
  // camera kit api staging ashiglav
  const apiToken =
    "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjg1NDI3NzE0LCJzdWIiOiIzNTAwZDQ3ZC1jNjQ5LTQ3OWYtYWQ5ZS0wNDMwODI4YTY1MmV-U1RBR0lOR340MDQwNmVlNC1mNTNhLTRkNTctOTljYi1iYTAyNzVjYjFjNTgifQ.gWIa_Mi5qJP0ZoOhBOo_p1eobtcuw17EQPLXoCT--c4";
  // lensuudiin group id
  const lensGroupId = "fadde968-b380-4bcf-a006-10de7fcd75fa";
  const cameraSelectRef = useRef(null);
  const lensSelectRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const cameraKit = await bootstrapCameraKit({ apiToken: apiToken });

      const session = await cameraKit.createSession();

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.replaceWith(session.output.live);
      }
      const { lenses } = await cameraKit.lenses.repository.loadLensGroups([
        lensGroupId,
      ]);
      session.applyLens(lenses[19]);
      await setCameraKitSource(session);
      await attachCamerasToSelect(session);
      console.log("attachCamerasToSelect is called");
      await attachLensesToSelect(lenses, session);
      console.log("attachLensesToSelect is called");
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
      video: { deviceId },
    });

    const source = createMediaStreamSource(video);

    await session.setSource(source);

    source.setTransform(Transform2D.MirrorX);

    session.play();
  };
  //camera songoh function
  const attachCamerasToSelect = async (session) => {
    cameraSelectRef.current.innerHTML = "";
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(({ kind }) => kind === "videoinput");

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.text = camera.label;
      cameraSelectRef.current.appendChild(option);
    });

    cameraSelectRef.current.addEventListener("change", (event) => {
      const deviceId = event.target.selectedOptions[0].value;
      setCameraKitSource(session, deviceId);
    });
  };
  // snapchat lens songoh function
  const attachLensesToSelect = async (lenses, session) => {
    lensSelectRef.current.innerHTML = "";
    lenses.forEach((lens) => {
      const option = document.createElement("option");
      option.value = lens.id;
      option.text = lens.name;
      lensSelectRef.current.appendChild(option);
    });

    lensSelectRef.current.addEventListener("change", (event) => {
      const lensId = event.target.selectedOptions[0].value;
      const lens = lenses.find((lens) => lens.id === lensId);
      if (lens) session.applyLens(lens);
    });
  };

  return (
    <div className="container">
      <canvas
        ref={canvasRef}
        id="canvas-container"
        width="1920"
        height="1080"
      ></canvas>
      <div className="footer">
        <select ref={cameraSelectRef} className="styled-select"></select>
        <select ref={lensSelectRef} className="styled-select"></select>
      </div>
    </div>
  );
};

export default SnapCamera;
