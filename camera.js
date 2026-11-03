const Camera = (() => {
  let stream = null, facing = "environment", track = null, capabilities = {};
  const video = document.getElementById("video");
  const $ = id => document.getElementById(id);
  function setStatus(on, text) {
    $("cameraStatus").classList.toggle("on", on);
    $("statusText").textContent = text;
  }
  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("このブラウザではカメラを利用できません。HTTPSまたは対応ブラウザで開いてください。");
    await stop();
    const selected = $("resolutionSelect").value;
    const heights = { "2160":2160, "1080":1080, "720":720, "480":480 };
    const videoConstraints = { facingMode: { ideal: facing }, height: { ideal: selected==="max"?2160:heights[selected] } };
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
    } catch (firstError) {
      if (selected !== "max") {
        try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:{ideal:facing} }, audio:false }); }
        catch (e) { throw friendlyError(e); }
      } else throw friendlyError(firstError);
    }
    video.srcObject = stream;
    await video.play();
    track = stream.getVideoTracks()[0];
    capabilities = track.getCapabilities ? track.getCapabilities() : {};
    $("cameraPlaceholder").hidden = true;
    $("captureButton").disabled = false; $("stopCamera").disabled = false;
    $("switchCamera").disabled = false; $("resolutionSelect").disabled = false;
    $("brightnessRange").disabled = false; $("zoomRange").disabled = false;
    setStatus(true, "カメラ起動中");
    updateLabels(); updateZoom();
    return true;
  }
  function friendlyError(e) {
    if (e.name==="NotAllowedError" || e.name==="SecurityError") return new Error("カメラへのアクセスが許可されていません。ブラウザのサイト設定でカメラを許可してください。");
    if (e.name==="NotFoundError" || e.name==="DevicesNotFoundError") return new Error("利用できるカメラが見つかりません。");
    if (e.name==="NotReadableError" || e.name==="TrackStartError") return new Error("カメラを起動できません。他のアプリが使用していないか確認してください。");
    return new Error(e.message || "カメラを起動できませんでした。");
  }
  async function stop() {
    if (stream) stream.getTracks().forEach(t=>t.stop());
    stream=null;track=null;video.srcObject=null;
    $("captureButton").disabled=true;$("stopCamera").disabled=true;$("switchCamera").disabled=true;
    $("resolutionSelect").disabled=true;$("brightnessRange").disabled=true;$("zoomRange").disabled=true;
    $("cameraPlaceholder").hidden=false;
    $("zoomRange").value=1;$("zoomRange").max=1;$("zoomRange").min=1;$("zoomOutput").textContent="1.0×";$("zoomLabel").textContent="1.0×";
    setStatus(false,"カメラ未起動");
  }
  function updateLabels() {
    const s=track?.getSettings?.()||{};
    $("resolutionLabel").textContent=s.width&&s.height?`${s.width}×${s.height}`:"LIVE";
  }
  function updateZoom() {
    if (!track) return;
    const cap=capabilities.zoom;
    const input=$("zoomRange");
    if (cap && cap.max>cap.min) {
      input.min=cap.min;input.max=cap.max;input.step=cap.step||0.1;
      const current=track.getSettings().zoom ?? cap.min;
      input.value=current; $("zoomOutput").textContent=Number(current).toFixed(1)+"×";$("zoomLabel").textContent=Number(current).toFixed(1)+"×";
    } else {
      input.min=1;input.max=1;input.value=1;
      $("zoomOutput").textContent="非対応";$("zoomLabel").textContent="1.0×";
    }
  }
  async function setZoom(value) {
    if (!track || !capabilities.zoom) return;
    try { await track.applyConstraints({advanced:[{zoom:Number(value)}]}); $("zoomOutput").textContent=Number(value).toFixed(1)+"×";$("zoomLabel").textContent=Number(value).toFixed(1)+"×"; }
    catch(e) { toast("このカメラではズームを変更できません"); }
  }
  async function switchFacing() {
    facing = facing==="environment" ? "user" : "environment";
    await start();
  }
  async function setResolution() {
    if (!stream) return;
    const old = $("resolutionSelect").value;
    try { await start(); toast("解像度設定を更新しました"); }
    catch(e) { $("resolutionSelect").value=old; toast(e.message); }
  }
  function getTrack(){return track}
  function getVideo(){return video}
  function isRunning(){return !!track}
  return {start,stop,switchFacing,setZoom,setResolution,getTrack,getVideo,isRunning};
})();