// import * as yup from 'yup';

// const schemaUrl = yup.string().url();

export default () => {
    const elements = {
      input: document.querySelector('input.form-control'),
      btnPrimary: document.querySelector('button.btn-primary'),
    };
  
    console.log('input  ', elements.input);
  };