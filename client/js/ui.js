const ui = (function(){
  function toast(msg, type='info', timeout=4000){
    let container = document.getElementById('toast-container');
    if(!container){
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(()=> el.classList.add('visible'), 10);
    setTimeout(()=>{
      el.classList.remove('visible');
      setTimeout(()=> el.remove(), 300);
    }, timeout);
  }

  function setLoading(isLoading, button){
    if(!button) return;
    if(isLoading){
      button.dataset._orig = button.innerHTML;
      button.innerHTML = '...';
      button.disabled = true;
    } else {
      if(button.dataset._orig) button.innerHTML = button.dataset._orig;
      button.disabled = false;
    }
  }

  return { toast, setLoading };
})();
