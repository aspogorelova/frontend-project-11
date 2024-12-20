import i18next from 'i18next';
import * as yup from 'yup';
import { isEmpty, uniqueId } from 'lodash';
import render from './render.js';
import resources from './locales/index.js';
import parser from './parser.js';

export default () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  yup.setLocale({
    string: {
      url: () => ({ key: 'falseUrl' }),
    },
  });

  const schemaUrl = yup.string().url();

  function validate(link) {
    try {
      schemaUrl.validateSync(link, { abortEarly: false });
      return {};
    } catch (error) {
      const messages = error.errors.map((err) => err.key);
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
    form: {
      isValid: true,
      error: '',
    },
    loadingProccess: {
      status: 'idle',
      error: '',
    },
    dataPosts: { // [{ idFeed, idPost, titlePost, descriptionPost, linkPost }]
      listPosts: [],
      openedPosts: [],
    },
    dataFeeds: [], // [{ idFeed, titleFeed, descriptionFeed, linkFeed }]
  };

  // Рендер не отрисовывает текстовую часть страницы!
  render(elements, initialState, i18nextInstance);
  elements.headerPage.textContent = i18nextInstance.t('contentPage.headerPage');
  elements.preheader.textContent = i18nextInstance.t('contentPage.preheader');
  elements.placeholder.textContent = i18nextInstance.t('contentPage.placeholder');
  elements.btnPrimary.textContent = i18nextInstance.t('contentPage.button');
  elements.example.textContent = i18nextInstance.t('contentPage.example');
  elements.footer.innerHTML = i18nextInstance.t('contentPage.footer');

  const state = render(elements, initialState, i18nextInstance);

  // Функция обновления постов
  const upgradePosts = (initialState) => {
    console.log('START UPGRADE', initialState.dataFeeds);
    state.dataFeeds.map(({ idFeed, linkFeed }) => {
      fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(linkFeed)}`)
        .then((response) => response.json)
        .then((data) => parser(data))
        .then(({ feed, posts }) => {
          console.log('FEED in upgrade  ', feed);
          console.log('POSTS in upgrade  ', posts);
        })      
    });
  };

  // Событие при клике
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    // Проверяем правильная ссылка или нет
    const checkUrl = validate(url);
    const checkError = isEmpty(checkUrl);
    // Проверяем есть ли ссылка среди фидов
    const arrLinksFeed = initialState.dataFeeds.map(({ linkFeed }) => linkFeed);
    const checkDubleLink = arrLinksFeed.includes(url);

    if (checkError === false) {
      initialState.form.isValid = checkError;
      state.form.error = String(checkUrl);
    };
    
    if (checkError === true) {
      initialState.form.error = '';
      if (checkDubleLink) {
        initialState.form.isValid = false;
        state.form.error = 'doubleUrl';
      } else {
        initialState.form.isValid = true;
        state.loadingProccess.status = 'load';
        const responseUrl = fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
        .then((response) => response.json())
        .then((data) => parser(data))
        .then(({ feed, posts }) => {
          feed.idFeed = uniqueId('feed_');
          posts.map((post) => {
            post.idFeed = feed.idFeed;
          });
          initialState.dataFeeds = initialState.dataFeeds.concat(feed);
          initialState.dataPosts.listPosts = initialState.dataPosts.listPosts.concat(posts);
          state.loadingProccess.status = 'success';
          console.log('initial state after add new feed and posts  ', initialState);
          // setInterval(upgradePosts(initialState), 10000);
        })
        .catch((error) => {
          console.log(error);
        });
      };
    }
  });
};
