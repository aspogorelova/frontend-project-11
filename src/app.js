/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import * as yup from 'yup';
import { uniqueId } from 'lodash';
import render from './render.js';
import resources from './locales/index.js';
import parser from './parser.js';

const createRequestUrl = (url) => {
  const baseUrl = new URL('https://allorigins.hexlet.app/get');
  baseUrl.searchParams.set('disableCache', 'true');
  baseUrl.searchParams.set('url', `${url}`);
  return baseUrl.href;
}

export default () => {
  const i18nextInstance = i18next.createInstance();
  const runApp = async () => {
    await i18nextInstance.init({
      lng: 'ru',
      debug: false,
      resources,
    });
  };
  runApp();

  yup.setLocale({
    string: {
      url: () => ({ key: 'falseUrl' }),
    },
  });

  const schemaUrl = yup.string().url();

  function validateUrl(link) {
    try {
      schemaUrl.validate(link, { abortEarly: false });
      return {};
    } catch (error) {
      console.log('error in validate  ', error);
      const messages = error.errors.map((err) => err.key);
      return messages;
    }
  }

  const elements = {
    input: document.querySelector('input.form-control'),
    btns: document.querySelectorAll('button'),
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
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    btnReadPost: document.querySelector('a.btn.btn-primary.full-article'),
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
      openedPosts: new Set(),
      idCurrentPost: '',
      statusUpgrade: 'success',
    },
    dataFeeds: [], // [{ idFeed, titleFeed, descriptionFeed, linkFeed }]
  };

  const state = render(elements, initialState, i18nextInstance);

  // Функция обновления постов
  const upgradePosts = (stateUp, initialStateUp) => {
    if (initialStateUp.dataFeeds.length > 0) {
      initialStateUp.dataPosts.statusUpgrade = 'check';
      // console.log('upgrade has changes  ');
      initialStateUp.dataFeeds.forEach(({ idFeed, linkFeed }) => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000);
        const url = createRequestUrl(linkFeed);
        fetch(url, { signal: controller.signal })
          .then((response) => response.json())
          .then((data) => parser(data))
          .then(({ posts }) => {
            const oldPosts = initialStateUp.dataPosts.listPosts.map(({ linkPost }) => linkPost);
            posts.forEach((post) => {
              if (!oldPosts.includes(post.linkPost)) {
                post.idFeed = idFeed;
                post.idPost = uniqueId('post_');
                initialStateUp.dataPosts.listPosts.unshift(post);
                stateUp.dataPosts.statusUpgrade = 'success';
              }
            });
          })
          .then(() => setTimeout(upgradePosts, 5000, state, initialState))
          .catch((e) => console.log(e));
      });
    }
  };

  upgradePosts(state, initialState);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const checkUrl = validateUrl(url)
      .then ((data) => console.log('success'))
      .catch((error) => {
        console.log('error after validate  ', error);
      });
    });
    
  // Клик по диву с постами
  elements.posts.addEventListener('click', (e) => {
    const idOpenedPost = e.target.closest('li').getAttribute('id');
    state.dataPosts.openedPosts.add(idOpenedPost);
    if (e.target.tagName === 'BUTTON') {
      e.preventDefault();
      state.dataPosts.idCurrentPost = idOpenedPost;
    }
  });
};
