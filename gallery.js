const Gallery = (() => {
  const $=id=>document.getElementById(id);
  let photos=[],selected=new Set(),selecting=false,currentPreview=null,objectUrls=[];
  function revokeUrls(){objectUrls.forEach(URL.revokeObjectURL);objectUrls=[];}
  function fmt(date){return new Date(date).toLocaleString("ja-JP",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});}
  async function refresh(){
    photos=await PhotoDB.getAll();selected.clear();render();
    $("photoCount").textContent=photos.length;
    $("gallerySummary").textContent=`${photos.length}枚の写真がこのブラウザに保存されています`;
  }
  function render(){
    const grid=$("galleryGrid");revokeUrls();grid.classList.toggle("selecting",selecting);
    if(!photos.length){grid.innerHTML=`<div class="empty-state"><div>▧</div><h2>写真はまだありません</h2><p>カメラで撮影すると、ここに写真が追加されます。</p><button class="primary-btn" data-goto-camera>カメラへ戻る</button></div>`;bindEmpty();updateActions();return;}
    grid.innerHTML=photos.map(p=>{
      const url=URL.createObjectURL(p.blob);objectUrls.push(url);
      return `<article class="photo-card ${selected.has(p.id)?"selected":""}" data-id="${p.id}" tabindex="0" role="button" aria-label="写真 ${fmt(p.createdAt)}"><div class="photo-check">✓</div><img src="${url}" alt="撮影写真" loading="lazy"><div class="photo-meta"><strong>${fmt(p.createdAt)}</strong><small>${p.width} × ${p.height}</small></div></article>`;
    }).join("");
    grid.querySelectorAll(".photo-card").forEach(card=>{
      const open=()=>selecting?toggle(card.dataset.id):openPreview(card.dataset.id);
      card.addEventListener("click",open);card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
    });
    updateActions();
  }
  function bindEmpty(){gridGoto();}
  function gridGoto(){document.querySelectorAll("[data-goto-camera]").forEach(b=>b.addEventListener("click",()=>App.showView("cameraView")));}
  function toggle(id){selected.has(id)?selected.delete(id):selected.add(id);render();}
  function updateActions(){
    $("selectModeButton").textContent=selecting?"選択終了":"選択";
    $("downloadSelected").disabled=selected.size===0;$("deleteSelected").disabled=selected.size===0;
    $("downloadSelected").textContent=selected.size?`選択を保存 (${selected.size})`:"選択を保存";
    $("deleteSelected").textContent=selected.size?`選択を削除 (${selected.size})`:"選択を削除";
  }
  async function openPreview(id){
    currentPreview=await PhotoDB.get(id);if(!currentPreview)return;
    const url=URL.createObjectURL(currentPreview.blob);
    $("previewImage").src=url;$("previewTitle").textContent=`${fmt(currentPreview.createdAt)} • ${currentPreview.width}×${currentPreview.height}`;
    $("previewModal").hidden=false;
    $("previewDownload").onclick=()=>Capture.download(currentPreview);
    $("previewDelete").onclick=async()=>{if(confirm("この写真を削除しますか？")){await PhotoDB.delete(id);closePreview();await refresh();toast("写真を削除しました");}};
  }
  function closePreview(){$("previewModal").hidden=true;const img=$("previewImage");if(img.src.startsWith("blob:"))URL.revokeObjectURL(img.src);img.src="";currentPreview=null;}
  async function downloadSelected(){for(const p of photos.filter(p=>selected.has(p.id)))await Capture.download(p);}
  async function deleteSelected(){if(!selected.size)return;if(!confirm(`${selected.size}枚の写真を削除しますか？`))return;for(const id of selected)await PhotoDB.delete(id);selecting=false;await refresh();toast("選択した写真を削除しました");}
  function toggleSelect(){selecting=!selecting;selected.clear();render();}
  async function clearAll(){if(!photos.length)return;if(!confirm("保存されている写真をすべて削除します。この操作は元に戻せません。"))return;await PhotoDB.clear();selecting=false;await refresh();toast("すべての写真を削除しました");}
  return {refresh,toggleSelect,downloadSelected,deleteSelected,clearAll,closePreview};
})();