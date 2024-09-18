const renderError = (els, val, prevVal, state) => {
  console.log('VAL  ', !val);
  console.log('PREV  ', !prevVal);
  if (!val && !prevVal) {
    return;
  }

  if (!val && prevVal) {
    console.log('no error');
    els.input.classList.remove('is-invalid');
    els.feedback.textContent = 'RSS успешно загружен';
    els.feedback.classList.remove('text-danger');
    els.feedback.classList.add('text-success');
  }

  if (val && !prevVal) {
    console.log('ERROR');
    els.input.classList.add('is-invalid');
    els.example.style.color = 'transparent';
    els.feedback.textContent = val;
  }
};

export default (elements, state) => (path, value, prevValue) => {
    console.log('STATE  ', state);
    console.log('path, value, prevValue  ', path, value, prevValue);

    switch (path) {
        case 'error':
            renderError(elements, value, prevValue, state);
    }
};