import i18next from 'i18next';
import * as yup from 'yup';
import { isEmpty } from 'lodash';
import render from './render.js';
import onChange from 'on-change';
import resources from './locales/index.js';

export default () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  yup.setLocale({
    string: {
      url: () => ({ key: 'falseRss' }),
    }
  });

const schemaUrl = yup.string().url();

function validate(link) {
  try {
    schemaUrl.validateSync(link, { abortEarly: false });
    return {};
  } catch (error) {
    // const messages = error.errors.map((err) => i18nextInstance.t(err.key));
    const messages = error.errors.map((err) => err.key);
    console.log('message error  ', error.errors.map((err) => err.key));
      return messages;
  }
}

    const elements = {
      input: document.querySelector('input.form-control'),
      btnPrimary: document.querySelector('button.btn-primary'),
      form: document.querySelector('form.rss-form'),
      feedback: document.querySelector('p.feedback'),
      example: document.querySelector('p.text-muted'),
      posts: document.querySelector('div.posts'),
      feeds: document.querySelector('div.feeds'),
      headerPage: document.querySelector('h1'),
      preheader: document.querySelector('p.lead'),
      placeholder: document.querySelector('label[for="url-input"]'),
      footer: document.querySelector('div.text-center'),
    };
  
    const initialState = {
      link: '',
      inputUi: false,
      dataPosts: [],
      dataFeeds: [{ link: 'https://thecipherbrief.com/feed', feed: { nameFeed: 'The Cipher Brief', describeFeed: 'Your Trusted Source for National Security News & Analysis' } }],
      error: '',
    };

    render(elements, initialState, i18nextInstance);
    elements.headerPage.textContent = i18nextInstance.t('contentPage.headerPage');
    elements.preheader.textContent = i18nextInstance.t('contentPage.preheader');
    elements.placeholder.textContent = i18nextInstance.t('contentPage.placeholder');
    elements.btnPrimary.textContent = i18nextInstance.t('contentPage.button');
    elements.example.textContent = i18nextInstance.t('contentPage.example');
    elements.footer.innerHTML = i18nextInstance.t('contentPage.footer');

    const state = onChange(initialState, render(elements, initialState, i18nextInstance));

    // Событие при клике
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      // Проверяем правильная ссылка или нет
      const checkUrl = validate(url);
      console.log('checkUrl in event  ', checkUrl);
      const checkError = isEmpty(checkUrl);
      // Проверяем есть ли ссылка среди фидов
      const arrLinksFeed = initialState.dataFeeds.map(({ link }) => link);
      const checkDubleLink = arrLinksFeed.includes(url);

      if (checkError === false) {
        console.log('error in app click');
        initialState.inputUi = checkError;
        state.error = 'falseRss';
      }
      if (checkDubleLink) {
        state.error = 'doubleRss';
        
      } else {
        initialState.error = '';
        state.inputUi = checkError;
      }
    });

    // render(elements, initialState, i18nextInstance);
  };