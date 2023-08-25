import React, { useEffect, useRef, useState } from "react";
import { bootstrapCameraKit } from "@snap/camera-kit";
import { Transform2D } from "@snap/camera-kit";
import { createMediaStreamSource } from "@snap/camera-kit";
import "./CameraKit.css";
import { useUploadVideoMutation } from "../../api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/autoplay";

let video;
const CameraKit = () => {
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [upload, uploadResponse] = useUploadVideoMutation();
  const [recording, setRecording] = useState(false);
  const [swiper, setSwiper] = useState(null);
  const [lenses, setLenses] = useState([]);
  const [isSelectedLens, setIsSelectedLens] = useState(null);
  const goNext = () => {
    swiper.slideNext();
  };
  const goPrev = () => {
    swiper.slidePrev();
  };

  useEffect(() => {
    if (uploadResponse.isError) {
      console.log("ERROR!!!");
      console.log(uploadResponse.error);
      window.location.reload();
    }
    if (uploadResponse.isSuccess) {
      console.log("SUCCESS!!!");
      console.log(uploadResponse.data);
      const img = new Image();
      img.src = uploadResponse.data.qrImage;
      img.onload = () => {
        imageRef.current.src = img.src;
      };
      setShow(true);
    }
  }, [uploadResponse]);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const imageRef = useRef(null);
  // camera kit api staging ashiglav
  const CameraKitApi =
    "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjg1NDI3NzE0LCJzdWIiOiIzNTAwZDQ3ZC1jNjQ5LTQ3OWYtYWQ5ZS0wNDMwODI4YTY1MmV-U1RBR0lOR340MDQwNmVlNC1mNTNhLTRkNTctOTljYi1iYTAyNzVjYjFjNTgifQ.gWIa_Mi5qJP0ZoOhBOo_p1eobtcuw17EQPLXoCT--c4";
  const lensGroupId = "55212fbf-a9dc-4286-8896-01bf0368a136";

  const DeviceCameraType = useRef(null);

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
        upload({ file });
        setRecording(false);
        setRemainingTime(15);
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
      // session.applyLens(lenses[1]);

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
    // }
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
    DeviceCameraType.current.innerHTML = "";
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(({ kind }) => kind === "videoinput");
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.text = camera.label;
      DeviceCameraType.current.appendChild(option);
    });
    DeviceCameraType.current.addEventListener("click", (event) => {
      const deviceId = event.target.selectedOptions[0].value;
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
        console.log(lens);
      });
    });
    setLenses(lenses);
  };

  const startRecording = () => {
    mediaRecorderRef.current.start();
    setRecording(true);
    console.log("Started Recording");
    setTimeout(() => {
      mediaRecorderRef.current.stop();
    }, 16000);
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  };

  const [remainingTime, setRemainingTime] = useState(15);

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

  return (
    <>
      <div
        className={`relative h-screen w-full mx-auto bg-black sm:bg-inherit flex justify-center`}
      >
        <img
          src="/greyLogo.png"
          className="absolute mx-auto top-14"
          alt="logo"
        />
        <div
          className={`${
            show1 ? "hidden" : "block"
          } flex flex-col justify-center items-center`}
        >
          <canvas ref={canvasRef} className={`w-screen h-screen`}></canvas>
          {!recording ? (
            <div className="bg-transparent absolute bottom-50% right-6 xl:right-[200px]">
              <Swiper
                modules={[Navigation, Pagination, Scrollbar]}
                spaceBetween={10}
                direction="vertical"
                slidesPerView={3}
                onSwiper={(s) => {
                  console.log("initialize swiper", s);
                  setSwiper(s);
                }}
                className="swiper mr-0 flex flex-col justify-center items-end w-20 h-[250px] bg-transparent"
              >
                {lenses.map((lens, index) => (
                  <SwiperSlide className={`w-20 rounded-full`} key={lens.id}>
                    <div className="selectLens" id={lens.id} key={lens.id}>
                      <img
                        src={lens.iconUrl}
                        alt={lens.name}
                        className={
                          isSelectedLens === index
                            ? `w-20 h-20 rounded-full p-1 border-red-500 border-[1px] cursor-pointer bg-transparent ml-auto`
                            : `w-12 h-12 mt-4 cursor-pointer bg-transparent ml-auto`
                        }
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : null}
          {!recording ? (
            <>
              <div className="bg-transparent absolute bottom-14 left-7">
                <div className="px-2 py-2 flex items-center gap-1 w-auto rigth-10 sm:w-auto  rounded-3xl bg-[#CD515266] text-white">
                  <select
                    ref={DeviceCameraType}
                    className="appearance-none bg-transparent text-[10px] text-white"
                  ></select>
                </div>
              </div>
              <div className="mx-auto bg-transparent absolute bottom-5">
                <button onClick={startRecording}>
                  <img
                    src="blackButton.png"
                    className="w-[90px] h-[90px] bg-transparent rounded-full"
                    alt="button"
                  />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center absolute bottom-5 rounded-full p-2 bg-transparent backdrop-blur-sm">
              <img
                src="timerBg1.png"
                className="absolute bg-transparent w-[90px] h-[90px]"
                alt="timer"
              />
              <div
                className="bg-transparent inline-block h-20 w-20 animate-spin rounded-full border-4 border-solid border-red-500 border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s]"
                role="status"
              ></div>
              <span className="text-white absolute bg-transparent font-bold text-3xl">
                {remainingTime}
              </span>
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
                  alt="button2"
                />
              </button>
              <button onClick={handleClick1} className="">
                <img
                  src="button1.png"
                  className="w-16 h-16 rounded-2xl bg-transparent"
                  alt="button1"
                />
              </button>
            </div>
            <div
              className={`${
                show1 ? "block" : "hidden"
              } px-7 flex flex-col gap-10 justify-center items-center`}
            >
              <div className="absolute w-full px-7 bg-transparent h-auto top-5 flex justify-between items-center">
                <img
                  src="Frame.png"
                  className="w-[92px] h-[26px]"
                  alt="frame"
                />
                <button
                  onClick={() => (setShow1(false), window.location.reload())}
                >
                  <img src="Fab.png" className="w-10 h-10" alt="fab" />
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
