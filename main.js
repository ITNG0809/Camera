function toast(message){
  const el=document.getElementById("toast");el.textContent=message;el.classList.add("show");
  clearTimeout(toast._timer);toast._timer=setTimeout(()=>el.classList.remove("show"),2800);
}
const App = (() => {
  const $=id=>document.getElementById(id);
  function showView(id){
    document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));
    document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===id));
    if(id==="galleryView")Gallery.refresh();
  }
  async function startCamera(){try{await Camera.start();}catch(e){toast(e.message);}}
  document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>showView(t.dataset.view)));
  $("startCamera").addEventListener("click",startCamera);
  $("stopCamera").addEventListener("click",()=>Camera.stop());
  $("switchCamera").addEventListener("click",async()=>{try{await Camera.switchFacing();toast("カメラを切り替えました");}catch(e){toast(e.message);}});
  $("captureButton").addEventListener("click",()=>Capture.takePhoto());
  $("selectModeButton").addEventListener("click",()=>Gallery.toggleSelect());
  $("downloadSelected").addEventListener("click",()=>Gallery.downloadSelected());
  $("deleteSelected").addEventListener("click",()=>Gallery.deleteSelected());
  $("closePreview").addEventListener("click",()=>Gallery.closePreview());
  $("previewModal").addEventListener("click",e=>{if(e.target.hasAttribute("data-close-preview"))Gallery.closePreview();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&Camera.isRunning()){Camera.stop();toast("画面を離れたためカメラを停止しました");}});
  $("brightnessRange").addEventListener("input",e=>{const v=e.target.value;$("video").style.filter=`brightness(${v/100})`;});
  $("formatSelect").dispatchEvent(new Event("change"));
  const mobileSettings = document.querySelector(".mobile-settings");
  const mobileLayout = window.matchMedia("(max-width: 600px)");
  const syncMobileSettings = () => { mobileSettings.open = !mobileLayout.matches; };
  syncMobileSettings();
  mobileLayout.addEventListener?.("change", syncMobileSettings);
  Gallery.refresh().catch(()=>toast("写真データベースを初期化できませんでした"));
  return {showView};
})();