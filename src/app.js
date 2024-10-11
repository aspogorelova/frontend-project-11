import * as yup from 'yup';
import { keyBy, isEmpty } from 'lodash';
import render from './render.js';
import onChange from 'on-change';
import rssParser from 'rss-parser';

const schemaUrl = yup.string().url();

const validate = (link) => {
  try {
    schemaUrl.validateSync(link, { abortEarly: false });
    return {};
  } catch (error) {
    return keyBy(error.inner, 'path');
  }
}

export default () => {
    const elements = {
      input: document.querySelector('input.form-control'),
      btnPrimary: document.querySelector('button.btn-primary'),
      form: document.querySelector('form.rss-form'),
      feedback: document.querySelector('p.feedback'),
      example: document.querySelector('p.text-muted'),
    };
  
    const initialState = {
      link: '',
      inputUi: false,
      error: '',
    }

    const state = onChange(initialState, render(elements, initialState));

    elements.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = await formData.get('url');
      const checkUrl = await validate(url);
      console.log('CHECK URL  ', checkUrl);
      state.inputUi = isEmpty(checkUrl);

      if (state.inputUi === false) {
        state.error = 'Ссылка должна быть валидным URL';
      } else {
        state.error = '';
      }
    });

    console.log('STATE  ', state);
  };