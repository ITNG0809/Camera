(() => {
  const $=id=>document.getElementById(id);
  $("settingsToggle").addEventListener("click",()=>$("settingsPanel").hidden=false);
  $("closeSettings").addEventListener("click",()=>$("settingsPanel").hidden=true);
  $("settingsPanel").addEventListener("click",e=>{if(e.target===$("settingsPanel"))$("settingsPanel").hidden=true;});
  $("brightnessRange").addEventListener("input",e=>{
    const v=Number(e.target.value);$("brightnessOutput").textContent=v+"%";
    $("video").style.setProperty("--unused","");$("video").style.filter=`brightness(${v/100})`;
  });
  $("qualityRange").addEventListener("input",e=>$("qualityOutput").textContent=e.target.value+"%");
  $("formatSelect").addEventListener("change",()=>$("qualityGroup").hidden=$("formatSelect").value!=="image/jpeg");
  $("clearAllPhotos").addEventListener("click",()=>Gallery.clearAll());
  $("resolutionSelect").addEventListener("change",()=>Camera.setResolution());
  $("zoomRange").addEventListener("input",e=>Camera.setZoom(e.target.value));
  $("gridToggle").addEventListener("click",()=>{
    const on=$("gridToggle").getAttribute("aria-pressed")!=="true";
    $("gridToggle").setAttribute("aria-pressed",String(on));drawGrid(on);
  });
  function drawGrid(on){
    const canvas=$("gridCanvas"),ctx=canvas.getContext("2d"),rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
    canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);ctx.scale(dpr,dpr);ctx.clearRect(0,0,rect.width,rect.height);
    if(!on)return;ctx.strokeStyle="rgba(255,255,255,.58)";ctx.lineWidth=1;
    for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(rect.width*i/3,0);ctx.lineTo(rect.width*i/3,rect.height);ctx.stroke();ctx.beginPath();ctx.moveTo(0,rect.height*i/3);ctx.lineTo(rect.width,rect.height*i/3);ctx.stroke();}
  }
  window.addEventListener("resize",()=>drawGrid($("gridToggle").getAttribute("aria-pressed")==="true"));
  window.drawGrid=drawGrid;
})();