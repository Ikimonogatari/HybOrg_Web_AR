import React, { useEffect, useRef, useState } from "react";
import { bootstrapCameraKit } from "@snap/camera-kit";
import { Transform2D } from "@snap/camera-kit";
import { createMediaStreamSource } from "@snap/camera-kit";
import "./CameraKit.css";
import { useUploadMutation } from "../../api";
import RenderLenses from "../Lenses";
import axios from "axios";

let video;

const CameraKit = () => {
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [upload, uploadResponse] = useUploadMutation();
  const [recording, setRecording] = useState(false);
  const [counting, setCounting] = useState(false);
  const [lenses, setLenses] = useState([]);
  const [isSelectedLens, setIsSelectedLens] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    if (uploadResponse.isError) {
      console.log("ERROR!!!");
      console.log(uploadResponse.error);
      window.location.reload();
    }
    if (uploadResponse.isSuccess) {
      console.log("SUCCESS!!!");
      console.log(uploadResponse.data);
      handleUpload(uploadResponse.data);

      const img = new Image();
      img.src = uploadResponse.data.qrImage;
      img.onload = () => {
        imageRef.current.src = img.src;
      };
      setShow(true);
    }
  }, [uploadResponse]);
  const handleUpload = async (data) => {
    if (videoFile) {
      const s3UploadUrl = data.signedUrl.url;
      try {
        const response = await axios.post(s3UploadUrl, videoFile, {
          headers: {
            "Content-Type": "video/mp4",
            // `multipart/form-data`,
          },
        });

        if (response.status === 200) {
          console.log("File uploaded successfully");
        } else {
          console.error("File upload failed");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        console.log("this is the video", videoFile);
      }
    }
  };
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const imageRef = useRef(null);
  // camera kit api staging ashiglav
  const CameraKitApi =
    "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjg1NDI3NzE0LCJzdWIiOiIzNTAwZDQ3ZC1jNjQ5LTQ3OWYtYWQ5ZS0wNDMwODI4YTY1MmV-U1RBR0lOR340MDQwNmVlNC1mNTNhLTRkNTctOTljYi1iYTAyNzVjYjFjNTgifQ.gWIa_Mi5qJP0ZoOhBOo_p1eobtcuw17EQPLXoCT--c4";
  const lensGroupId = "55212fbf-a9dc-4286-8896-01bf0368a136";

  useEffect(() => {
    const init = async () => {
      const cameraKit = await bootstrapCameraKit({ apiToken: CameraKitApi });
      const session = await cameraKit.createSession();
      const canvas = canvasRef.current;

      let videoStream = session.output.live.captureStream(30);
      mediaRecorderRef.current = new MediaRecorder(videoStream);
      mediaRecorderRef.current.onstop = function (e) {
        console.log(chunksRef.current);
        let blob = new Blob(chunksRef.current, { type: "video/mp4" });
        const file = new File([blob], "video.mp4", { type: "video/mp4" });
        chunksRef.current = [];
        console.log(file);
        setVideoFile(file);
        upload();
        setRecording(false);
        setRemainingTime(5);
      };

      mediaRecorderRef.current.ondataavailable = function (e) {
        chunksRef.current.push(e.data);
        console.log("Pushing data");
        console.log(e.data);
      };

      if (canvas) canvas.replaceWith(session.output.live);
      const { lenses } = await cameraKit.lenses.repository.loadLensGroups([
        lensGroupId,
      ]);
      setLenses(lenses);
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
      video: {
        deviceId,
      },
    });
    const source = createMediaStreamSource(video);
    await session.setSource(source);
    source.setTransform(Transform2D.MirrorX);

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    source.setRenderSize(screenWidth, screenHeight);
    session.play();
  };
  useEffect(() => {
    const enumerateDevices = async () => {
      if (!navigator.mediaDevices?.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
      } else {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          devices.forEach((device) => {
            console.log(
              `${device.kind}: ${device.label} id = ${device.deviceId}`
            );
          });
        } catch (err) {
          console.error(`${err.name}: ${err.message}`);
        }
      }
    };

    enumerateDevices();
  }, []);
  //camera songoh function
  const attachCamerasToSelect = async (session) => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(({ kind }) => kind === "videoinput");
    let selectedCameraIndex = 0;
    const selectedCamera = document.querySelector(".selectedCamera");
    selectedCamera.addEventListener("click", (event) => {
      selectedCameraIndex = (selectedCameraIndex + 1) % cameras.length;
      const deviceId = cameras[selectedCameraIndex].deviceId;
      setCameraKitSource(session, deviceId);
    });
  };

  // snapchat lens songoh function
  const attachLensesToSelect = async (lenses, session) => {
    const selectLens = document.querySelectorAll(".selectLens");
    selectLens.forEach((div) => {
      div.addEventListener("click", () => {
        const lensId = div.id;
        const lens = lenses.find((lens) => lens.id === lensId);
        if (lens) session.applyLens(lens);
        const lensIndex = lenses.indexOf(lens);
        setIsSelectedLens(lensIndex);
      });
    });
  };
  const startRecording = () => {
    mediaRecorderRef.current.start();
    setRecording(true);
    setTimeout(() => {
      mediaRecorderRef.current.stop();
    }, 6000);
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  };
  const startCounting = () => {
    setCounting(true);
    setTimeout(() => {
      setCounting(false);
      startRecording();
    }, 3000);
    if (remainingCount > 0) {
      const count = setInterval(() => {
        setRemainingCount((prevTime) => prevTime - 1);
      }, 1000);
      return () => {
        clearInterval(count);
      };
    }
  };

  const [remainingTime, setRemainingTime] = useState(5);
  const [remainingCount, setRemainingCount] = useState(3);
  const handleClick = () => {
    if (show) {
      setShow(false);
      window.location.reload();
    } else {
      setShow(true);
    }
  };
  const handleClick1 = () => {
    if (show1) {
      setShow1(false);
    } else {
      setShow(false);
      setShow1(true);
    }
  };
  const handleCameraTurn = () => {};

  return (
    <>
      <div
        id="lit"
        className={`relative h-screen w-full mx-auto bg-black sm:bg-inherit flex justify-center`}
      >
        <img src="/greyLogo.png" className="absolute mx-auto top-14" alt="" />
        <div
          className={`${
            show1 ? "hidden" : "block"
          } flex flex-col justify-center items-center`}
        >
          <canvas ref={canvasRef} className={`w-screen h-screen`}></canvas>
          {!recording ? (
            <RenderLenses lenses={lenses} isSelectedLens={isSelectedLens} />
          ) : null}
          {!counting ? (
            !recording ? (
              <>
                <div className="bg-transparent absolute bottom-[72px] right-10 xl:right-[200px]">
                  <button className="selectedCamera" onClick={handleCameraTurn}>
                    <img src="/turn.png" className="w-[52px] h-[52px]" alt="" />
                  </button>
                </div>
                <div className="mx-auto bg-transparent absolute bottom-14">
                  <div className="cursor-pointer" onClick={startCounting}>
                    <img
                      src="blackButton.png"
                      className="w-[90px] h-[90px] bg-transparent rounded-full"
                      alt=""
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center absolute bottom-10 rounded-full p-2 bg-transparent backdrop-blur-sm">
                <img
                  src="timerBg1.png"
                  className="absolute bg-transparent w-[90px] h-[90px]"
                  alt=""
                />
                <div
                  className="bg-transparent inline-block h-20 w-20 animate-spin rounded-full border-4 border-solid border-red-500 border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s]"
                  role="status"
                ></div>
                <span className="text-white absolute bg-transparent font-bold text-3xl">
                  {remainingTime}
                </span>
              </div>
            )
          ) : (
            <div className="bg-[#000000CC] w-full h-screen backdrop-blur-sm absolute z-50 flex items-center justify-center text-4xl font-semibold text-white">
              {remainingCount}
            </div>
          )}
        </div>
        {uploadResponse.isSuccess ? (
          <>
            <div
              className={`${
                show ? "block" : "hidden"
              } absolute z-50 w-screen h-screen flex gap-6 justify-center items-center bg-[#000000CC] backdrop-blur-sm`}
            >
              <button onClick={handleClick} className="">
                <img
                  src="button2.png"
                  className="w-16 h-16 rounded-2xl bg-transparent"
                  alt=""
                />
              </button>
              <button onClick={handleClick1} className="">
                <img
                  src="button1.png"
                  className="w-16 h-16 rounded-2xl bg-transparent"
                  alt=""
                />
              </button>
            </div>
            <div
              className={`${
                show1 ? "block" : "hidden"
              } px-7 flex flex-col gap-10 justify-center items-center`}
            >
              <div className="absolute w-full px-7 bg-transparent h-auto top-5 flex justify-between items-center">
                <button
                  onClick={() => (setShow1(false), window.location.reload())}
                >
                  <img src="Fab.png" className="w-10 h-10" alt="mr-0" />
                </button>
              </div>
              <span className="text-white font-bold text-center text-2xl ">
                QR кодыг уншуулаад өөрийн бичлэгээ аваарай.
              </span>
              <img
                ref={imageRef}
                alt="QR Code"
                className="w-[173px] h-[173px]"
              />
              <span className="text-white font-bold text-center text-2xl">
                @hyb_org Mention хийгээрэй
              </span>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};

export default CameraKit;
