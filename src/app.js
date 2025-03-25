/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import * as yup from 'yup';
import { flatMap, uniqueId } from 'lodash';
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
    return schemaUrl.validate(link, { abortEarly: true })
    .then(() => {})
    .catch(() => {
      throw new Error('falseUrl');
    });
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
    let promise = new Promise((upgrade) => {
      upgrade(stateUp, initialStateUp);
    });

    promise.then(
      () => {
        initialStateUp.dataFeeds.map(({ idFeed, linkFeed }) => {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 5000);
          const url = createRequestUrl(linkFeed);
          fetch(url, { signal: controller.signal })
            .then((response) => response.json())
            .then((data) => parser(data))
            .then(({ title, items }) => {
              const oldPosts = initialStateUp.dataPosts.listPosts.map(({ linkPost }) => linkPost);
              const newPosts = items.filter((post) => {
                if (!oldPosts.includes(post.linkPost)) {
                  post.idFeed = idFeed;
                  post.idPost = uniqueId('post_');
                  return post;
                }
              });
              stateUp.dataPosts.listPosts = [...newPosts, ...stateUp.dataPosts.listPosts];
            })
        })
      })
    .then(() => setTimeout(upgradePosts, 5000, stateUp, initialStateUp))
    .catch((error) => console.log('error upgrade  ', error));
  };

  upgradePosts(state, initialState);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    validateUrl(url)
      .then (() => {
        const arrLinksFeed = initialState.dataFeeds.map(({ linkFeed }) => linkFeed);
        if (arrLinksFeed.includes(url)) {
          throw new Error('doubleUrl');
        }
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000);
        const proxy = createRequestUrl(url);
        fetch(proxy, { signal: controller.signal })
          .then((response) => response.json())
          .then((data) => parser(data, url))
          .then(({ title, items }) => {
            initialState.form.isValid = true;
            state.loadingProccess.status = 'load';
            title.idFeed = uniqueId('feed_');
            initialState.dataFeeds.push(title);
            let listPosts = [];
            items.forEach((post) => {
              post.idFeed = title.idFeed;
              post.idPost = uniqueId('post_');
              listPosts.push(post);
            });
            state.dataPosts.listPosts = [...state.dataPosts.listPosts, ...listPosts];
            state.loadingProccess.status = 'success';
        })
      })
      .catch((error) => {
        console.log('error in app ', error);
        initialState.form.isValid = false;
        state.form.error = String(error.message);
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
