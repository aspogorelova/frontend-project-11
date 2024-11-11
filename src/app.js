import * as yup from 'yup';
import { keyBy, isEmpty } from 'lodash';
import render from './render.js';
import onChange from 'on-change';

const schemaUrl = yup.string().url();

function validate(link) {
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
      posts: document.querySelector('div.posts'),
      feeds: document.querySelector('div.feeds'),
    };
  
    const initialState = {
      link: '',
      inputUi: false,
      dataPosts: [],
      dataFeeds: [{ link: 'https://thecipherbrief.com/feed', feed: { nameFeed: 'The Cipher Brief', describeFeed: 'Your Trusted Source for National Security News & Analysis' } }],
      error: '',
    }

    const state = onChange(initialState, render(elements, initialState));

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      const checkUrl = validate(url);
      // console.log('checkUrl  ', checkUrl);
      const checkError = isEmpty(checkUrl);
      // Проверяем есть ли ссылка среди фидах
      const arrLinksFeed = initialState.dataFeeds.map(({ link }) => link);
      // console.log('arrLinksFeed  ', arrLinksFeed);
      const checkDubleLink = arrLinksFeed.includes(url);
      // console.log('check double link  ', checkDubleLink);

      if (checkError === false) {
        console.log('error in app click');
        initialState.inputUi = checkError;
        state.error = 'Ссылка должна быть валидным URL';
        // console.log('state in app click error', state);
      }
      if (checkDubleLink) {
        state.error = 'RSS уже существует';
        
      } else {
        initialState.error = '';
        state.inputUi = checkError;
      }
    });

  };