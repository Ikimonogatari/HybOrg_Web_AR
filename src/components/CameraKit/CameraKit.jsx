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
  const [isSource, setIsSource] = useState(null);
  const [recording, setRecording] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);

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
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);

  // camera kit api staging ashiglav
  const CameraKitApi =
    "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjg1NDI3NzE0LCJzdWIiOiIzNTAwZDQ3ZC1jNjQ5LTQ3OWYtYWQ5ZS0wNDMwODI4YTY1MmV-U1RBR0lOR340MDQwNmVlNC1mNTNhLTRkNTctOTljYi1iYTAyNzVjYjFjNTgifQ.gWIa_Mi5qJP0ZoOhBOo_p1eobtcuw17EQPLXoCT--c4";
  const lensGroupId = "fadde968-b380-4bcf-a006-10de7fcd75fa";
  const DeviceCameraType = useRef(null);
  const SnapLenses = useRef(null);

  let saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (url) {
      a.href = url;
      a.download = "snap-hyborg";
      a.click();
      // window.URL.revokeObjectURL(url);
    };
  })();

  useEffect(() => {
    const init = async () => {
      const cameraKit = await bootstrapCameraKit({ apiToken: CameraKitApi });
      const session = await cameraKit.createSession();
      const canvas = canvasRef.current;

      let videoStream = session.output.live.captureStream(30);
      mediaRecorderRef.current = new MediaRecorder(videoStream);
      mediaRecorderRef.current.onstop = function (e) {
        let blob = new Blob(chunksRef.current, { type: "video/mp4" });
        chunksRef.current = [];
        let url = URL.createObjectURL(blob);
        console.log(url);
        videoRef.current.src = url;
        setIsSource(url);
        saveData(url);
        setIsRecorded(true);
        setRecording(false);
        // window.location.assign(url)
      };

      mediaRecorderRef.current.ondataavailable = function (e) {
        chunksRef.current.push(e.data);
      };

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
  const startRecording = () => {
    mediaRecorderRef.current.start();
    setRecording(true);
    console.log("Started Recording");
    setTimeout(() => {
      mediaRecorderRef.current.stop();
    }, 15000);
  };

  const [remainingTime, setRemainingTime] = useState(15);
  const [remainingTime1, setRemainingTime1] = useState(3);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [remainingTime]);

  const [showElement, setShowElement] = useState(false);
  useEffect(() => {
    if (remainingTime1 > 0) {
      const timer1 = setInterval(() => {
        setRemainingTime1((prevTime1) => prevTime1 - 1);
      }, 1000);

      return () => {
        clearInterval(timer1);
      };
    }
  }, [showElement]);
  const handleClick = () => {
    setShowElement(true);
    // startRecording();
    setTimeout(() => {
      setShowElement(false);
      startRecording();
    }, 3000);
  };
  return (
    <>
      <div
        className={`${
          showElement ? "block" : "hidden"
        } absolute z-50 w-screen h-screen flex justify-center items-center bg-[#000000CC] backdrop-blur-sm`}>
        <span className='text-white font-extrabold text-5xl bg-transparent text-center'>
          {remainingTime1}
        </span>
      </div>
      <div className='relative h-screen sm:h-full w-full mx-auto bg-black sm:bg-inherit container mt-0 sm:mt-[200px]'>
        <div className='flex flex-col justify-center items-center'>
          <div className={isRecorded ? "hidden" : "block"}>
            <canvas
              ref={canvasRef}
              className={`${
                isRecorded ? "hidden" : "block"
              } w-screen h-screen`}></canvas>
          </div>
          <video
            controls
            ref={videoRef}
            className={`${
              isRecorded ? "block" : "hidden"
            }  w-screen h-screen z-50`}
          />
          <div className='flex absolute top-10 right-10 items-center justify-end gap-16 bg-transparent'>
            <img src='mbank.png' className='w-[130px] h-12 bg-transparent' />
            <button>
              <img src='camera.png' className='w-6 h-6 bg-transparent' />
            </button>
          </div>
          {!recording ? (
            <div className='bg-transparent flex flex-col items-end gap-3 absolute bottom-50% right-6'>
              <div className='px-2 py-2 flex items-center gap-1 w-2/3 sm:w-auto  rounded-3xl bg-[#CD515266] text-white'>
                <select
                  ref={DeviceCameraType}
                  className='appearance-none bg-transparent text-[10px] text-white'></select>
              </div>
              <button
                onClick={handleClick}
                className={`${isRecorded ? "hidden" : "block"}`}>
                <img
                  src='button.png'
                  className='w-[90px] h-[90px] bg-transparent rounded-full'
                />
              </button>
              <div className='px-2 py-2 flex items-center gap-1 w-1/2 sm:w-auto rounded-3xl bg-[#CD515266] text-white'>
                <select
                  ref={SnapLenses}
                  className='appearance-none bg-transparent text-[10px] text-white'></select>
              </div>
            </div>
          ) : (
            <div className='flex sm:hidden items-center justify-center absolute bottom-50% right-6 rounded-full p-2 bg-transparent backdrop-blur-sm'>
              <img src='timerBG.png' className='absolute bg-transparent' />
              <div
                className='bg-transparent inline-block h-20 w-20 animate-spin rounded-full border-4 border-solid border-white border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s]'
                role='status'></div>
              <span className='text-white absolute bg-transparent font-bold text-3xl'>
                {remainingTime}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CameraKit;
