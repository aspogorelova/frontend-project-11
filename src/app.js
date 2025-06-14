import i18next from 'i18next'
import * as yup from 'yup'
import axios from 'axios'
import { uniqueId } from 'lodash'
import render from './render.js'
import resources from './locales/index.js'
import parser from './parser.js'
import createRequestUrl from './createRequestUrl.js'

export default () => {
  const i18nextInstance = i18next.createInstance()
  const runApp = async () => {
    await i18nextInstance.init({
      lng: 'ru',
      debug: false,
      resources,
    })
  }
  runApp()

  yup.setLocale({
    string: {
      url: () => ({ key: 'falseUrl' }),
    },
  })

  const schemaUrl = yup.string().url()

  function validateUrl(link) {
    return schemaUrl.validate(link, { abortEarly: true })
      .catch(() => {
        throw new Error('falseUrl')
      })
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
  }

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
  }

  const state = render(elements, initialState, i18nextInstance)

  // Функция обновления постов
  const upgradePosts = (stateUp) => {
    const promises = stateUp.dataFeeds.map(({ idFeed, linkFeed }) => {
      const proxyUrl = createRequestUrl(linkFeed)
      return axios.get(proxyUrl)
        .then((data) => {
          const { items } = parser(data.data)
          const oldPosts = stateUp.dataPosts.listPosts.map(({ linkPost }) => linkPost)
          const newPosts = items.filter((post) => {
            if (!oldPosts.includes(post.linkPost)) {
              post.idFeed = idFeed
              post.idPost = uniqueId('post_')
              return true
            }
            return false
          })

          return newPosts
        })
        .catch((e) => {
          throw e
        })
    })

    Promise.all(promises)
      .then((resultUpgrade) => {
        resultUpgrade.forEach((newPost) => {
          stateUp.dataPosts.listPosts = [...newPost, ...stateUp.dataPosts.listPosts]
        })
        setTimeout(() => upgradePosts(stateUp), 5000)
      })
      .catch(error => console.log('error upgrade', error))
  }

  upgradePosts(state)

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const url = formData.get('url')
    state.loadingProccess.status = 'load'

    validateUrl(url)
      .then(() => {
        const arrLinksFeed = state.dataFeeds.map(({ linkFeed }) => linkFeed)
        if (arrLinksFeed.includes(url)) {
          throw new Error('doubleUrl')
        }
      })
      .then(() => {
        const proxyUrl = createRequestUrl(url)
        return axios.get(proxyUrl, { timeout: 5000 })
          .catch(() => { throw new Error('abortError') })
      })
      .then((dataResponse) => {
        const { title, items } = parser(dataResponse.data, url)
        state.form.isValid = true
        title.idFeed = uniqueId('feed_')
        state.dataFeeds.push(title)
        const listPosts = []
        items.forEach((post) => {
          post.idFeed = title.idFeed
          post.idPost = uniqueId('post_')
          listPosts.push(post)
        })

        state.dataPosts.listPosts = [...state.dataPosts.listPosts, ...listPosts]
        state.loadingProccess.status = 'success'
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          state.form.isValid = false
          state.form.error = 'abortError'
        }
        else {
          state.form.isValid = false
          state.form.error = String(error.message)
        }
        state.loadingProccess.status = 'success'
      })
  })

  // Клик по диву с постами
  elements.posts.addEventListener('click', (e) => {
    const idOpenedPost = e.target.closest('li').getAttribute('id')
    state.dataPosts.openedPosts.add(idOpenedPost)
    if (e.target.tagName === 'BUTTON') {
      e.preventDefault()
      state.dataPosts.idCurrentPost = idOpenedPost
    }
  })
}
