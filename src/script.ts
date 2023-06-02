import {
  bootstrapCameraKit,
  CameraKitSession,
  createMediaStreamSource,
  Transform2D,
  Lens,
} from "@snap/camera-kit";

let mediaStream: MediaStream;

async function init() {
  const liveRenderTarget = document.getElementById(
    "canvas"
  ) as HTMLCanvasElement;
  const cameraKit = await bootstrapCameraKit({
    apiToken:
      "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjg1NDI3NzE0LCJzdWIiOiIzNTAwZDQ3ZC1jNjQ5LTQ3OWYtYWQ5ZS0wNDMwODI4YTY1MmV-U1RBR0lOR340MDQwNmVlNC1mNTNhLTRkNTctOTljYi1iYTAyNzVjYjFjNTgifQ.gWIa_Mi5qJP0ZoOhBOo_p1eobtcuw17EQPLXoCT--c4",
  });
  const session = await cameraKit.createSession({ liveRenderTarget });
  const { lenses } = await cameraKit.lenses.repository.loadLensGroups([
    "a8555543-955a-464f-a578-560394df3eb0",
  ]);

  session.applyLens(lenses[0]);

  await setCameraKitSource(session);

  attachCamerasToSelect(session);
  attachLensesToSelect(lenses, session);
}

async function setCameraKitSource(
  session: CameraKitSession,
  deviceId?: string
) {
  if (mediaStream) {
    session.pause();
    mediaStream.getVideoTracks()[0].stop();
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId },
  });

  const source = createMediaStreamSource(mediaStream);

  await session.setSource(source);

  source.setTransform(Transform2D.MirrorX);

  session.play();
}

async function attachCamerasToSelect(session: CameraKitSession) {
  const cameraSelect = document.getElementById("cameras") as HTMLSelectElement;
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter(({ kind }) => kind === "videoinput");

  cameras.forEach((camera) => {
    const option = document.createElement("option");

    option.value = camera.deviceId;
    option.text = camera.label;

    cameraSelect.appendChild(option);
  });

  cameraSelect.addEventListener("change", (event) => {
    const deviceId = (event.target as HTMLSelectElement).selectedOptions[0]
      .value;

    setCameraKitSource(session, deviceId);
  });
}

async function attachLensesToSelect(lenses: Lens[], session: CameraKitSession) {
  const lensSelect = document.getElementById("lenses") as HTMLSelectElement;

  lenses.forEach((lens) => {
    const option = document.createElement("option");

    option.value = lens.id;
    option.text = lens.name;

    lensSelect.appendChild(option);
  });

  lensSelect.addEventListener("change", (event) => {
    const lensId = (event.target as HTMLSelectElement).selectedOptions[0].value;
    const lens = lenses.find((lens) => lens.id === lensId);

    if (lens) session.applyLens(lens);
  });
}

init();
