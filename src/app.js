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
      statusUpgrade: 'success',
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
  const upgradePosts = (state, initialState) => {
    if (initialState.dataFeeds.length > 0) {
      initialState.dataPosts.statusUpgrade = 'check';
      initialState.dataFeeds.map(({ idFeed, linkFeed }) => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000);
        const url = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(linkFeed)}`;
        fetch(url, { signal: controller.signal })
          .then((response) => response.json())
          .then((data) => parser(data))
          .then(({ posts }) => {
            const oldPosts = initialState.dataPosts.listPosts.map(({ linkPost }) => linkPost);
            posts.filter((post) => {
              if (!oldPosts.includes(post.linkPost)) {
                post.idFeed = idFeed;
                post.idPost = uniqueId('post_');
                initialState.dataPosts.listPosts.unshift(post);
                state.dataPosts.statusUpgrade = 'success';
              }
            });
          })
          .catch((e) => console.log(e));
      });
    }

    setTimeout(upgradePosts, 20000, state, initialState);
  };

  upgradePosts(state, initialState);

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
    }

    if (checkError === true) {
      initialState.form.error = '';
      if (checkDubleLink) {
        initialState.form.isValid = false;
        state.form.error = 'doubleUrl';
      } else {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 10000);
        const proxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
        fetch(proxy, { signal: controller.signal })
          .then((response) => response.json())
          .then((data) => parser(data))
          .then(({ feed, posts }) => {
            initialState.form.isValid = true;
            state.loadingProccess.status = 'load';
            feed.idFeed = uniqueId('feed_');
            initialState.dataFeeds.push(feed);
            posts.map((post) => {
              post.idFeed = feed.idFeed;
              post.idPost = uniqueId('post_');
              initialState.dataPosts.listPosts.unshift(post);
            });
            state.loadingProccess.status = 'success';
          })
          .catch((error) => {
            initialState.form.isValid = false;
            if (error.message !== 'AbortError') {
              state.form.error = error.message;
            }

            if (error.name === 'AbortError') {
              state.form.error = 'abortError';
            }
          });
      }
    }
  });
};
