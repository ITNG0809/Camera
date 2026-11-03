const Capture = (() => {
  const $=id=>document.getElementById(id);
  function canvasBlob(canvas,type,quality) {
    return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("画像を生成できませんでした")),type,quality));
  }
  async function takePhoto() {
    if (!Camera.isRunning()) return;
    const timer=Number($("timerSelect").value);
    if(timer>0){
      $("timerOverlay").hidden=false;
      for(let i=timer;i>0;i--){$("timerOverlay").textContent=i;await new Promise(r=>setTimeout(r,1000));}
      $("timerOverlay").textContent="●";await new Promise(r=>setTimeout(r,250));$("timerOverlay").hidden=true;
    }
    const video=Camera.getVideo(), canvas=$("captureCanvas");
    const w=video.videoWidth,h=video.videoHeight;
    if(!w||!h){toast("カメラ映像の準備ができていません");return;}
    canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext("2d",{alpha:false});
    const brightness=Number($("brightnessRange").value)/100;
    ctx.filter=`brightness(${brightness})`;
    // Front camera mirrors only the preview? Keep saved image natural by default.
    ctx.drawImage(video,0,0,w,h);
    ctx.filter="none";
    const type=$("formatSelect").value,quality=Number($("qualityRange").value)/100;
    try{
      const blob=await canvasBlob(canvas,type,type==="image/jpeg"?quality:undefined);
      const photo={id:crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random(),createdAt:Date.now(),blob,type:blob.type||type,width:w,height:h,name:`SilentCam_${new Date().toISOString().replace(/[:.]/g,"-")}.${type==="image/png"?"png":"jpg"}`};
      await PhotoDB.add(photo);
      await Gallery.refresh();
      toast("写真を保存しました");
    }catch(e){toast("写真を保存できませんでした: "+e.message);}
  }
  async function download(photo) {
    const url=URL.createObjectURL(photo.blob),a=document.createElement("a");
    a.href=url;a.download=photo.name||"SilentCam.jpg";document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  return {takePhoto,download};
})();