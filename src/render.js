import onChange from 'on-change';

// ИНПУТ
const renderResultCheckedInput = (els, state, i18next) => {
  const { feedback, input } = els;
  if (state.form.isValid === true) {
    feedback.textContent = '';
    feedback.classList.remove('text-danger');
    input.classList.remove('is-invalid');
    feedback.classList.add('text-success');
    feedback.textContent = i18next.t('feedback.success');
  } else {
    feedback.textContent = i18next.t(`feedback.${state.form.error}`);
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
  }
};

// ЗАГРУЗКА ДАННЫХ
const loadingProccess = (els, state, i18next) => {
  const {
    input, btnPrimary, feedback,
  } = els;
  if (state.loadingProccess.status === 'load') {
    input.value = '';
    btnPrimary.disabled = true;
  }

  if (state.loadingProccess.status === 'success') {
    btnPrimary.disabled = false;
  }

  renderResultCheckedInput(els, state, i18next);
}

// РЕЗУЛЬТАТ
const renderResult = (els, state, i18next) => {
  renderResultCheckedInput(els, state, i18next);
  const { posts, feeds } = els;  

  // Рисуем колонку с постами. Заголовок Посты
  posts.innerHTML = '';
  const divCardPost = document.createElement('div');
  divCardPost.classList.add('card', 'border-0');
  posts.append(divCardPost);
  const divCardBodyPosts = document.createElement('div');
  divCardBodyPosts.classList.add('card-body');
  divCardPost.append(divCardBodyPosts);
  const headerPosts = document.createElement('h2');
  headerPosts.classList.add('card-title', 'h4');
  headerPosts.textContent = i18next.t('contentPage.headerPosts');
  divCardBodyPosts.append(headerPosts);

  // Рисуем список из постов
  const ulPosts = document.createElement('ul');
  ulPosts.classList.add('list-group', 'border-0', 'rounded-0');
  state.dataPosts.listPosts.forEach((post) => {
    const li = document.createElement('li');
    li.setAttribute('id', post.idPost);
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    if (Array.from(state.dataPosts.openedPosts).includes(post.idPost)) {
      link.classList.add('fw-normal');
      link.style.color = 'grey';
    } else {
      link.classList.add('fw-bold');
    }
    link.setAttribute('href', post.linkPost);
    link.setAttribute('target', '_blank');
    link.textContent = post.titlePost;
    li.append(link);
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = i18next.t('contentPage.buttonPostWatch');
    li.append(button);
    ulPosts.append(li);
  });
  divCardBodyPosts.append(ulPosts);

  // Рисуем колонку с фидами. Заголовок Фиды.
  feeds.innerHTML = '';
  const divCardFeeds = document.createElement('div');
  divCardFeeds.classList.add('card', 'border-0');
  feeds.append(divCardFeeds);
  const divCardBodyFeeds = document.createElement('div');
  divCardBodyFeeds.classList.add('card-body');
  divCardFeeds.append(divCardBodyFeeds);
  const headerFeeds = document.createElement('h2');
  headerFeeds.classList.add('card-title', 'h4');
  headerFeeds.textContent = i18next.t('contentPage.headerFeeds');
  divCardBodyFeeds.append(headerFeeds);

  // Рисуем список фидов
  const ulFeeds = document.createElement('ul');
  ulFeeds.classList.add('list-group', 'border-0', 'rounded-0');
  state.dataFeeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const headerFeed = document.createElement('h3');
    headerFeed.classList.add('h6', 'm-0');
    headerFeed.textContent = feed.titleFeed;
    const textFeed = document.createElement('p');
    textFeed.classList.add('m-0', 'small', 'text-black-50');
    textFeed.textContent = feed.descriptionFeed;
    li.append(headerFeed);
    li.append(textFeed);
    ulFeeds.prepend(li);
  });
  divCardBodyFeeds.append(ulFeeds);
  };

// МОДАЛЬНОЕ ОКНО
const renderModal = (els, state) => {
  const { modalBody, modalTitle, btnReadPost } = els;
  state.dataPosts.listPosts.forEach((post) => {
    if (post.idPost === state.dataPosts.idCurrentPost) {
      modalTitle.textContent = post.titlePost;
      modalBody.textContent = post.descriptionPost;
      btnReadPost.setAttribute('href', `${post.linkPost}`);
    }
  });
};

export default (elements, state, i18next) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.error': renderResultCheckedInput(elements, state, i18next);
        break;

      case 'dataPosts.listPosts': renderResult(elements, state, i18next);
        break;

      case 'loadingProccess.status': loadingProccess(elements, state, i18next);
        break;

      case 'dataPosts.statusUpgrade': renderResult(elements, state, i18next);
        break;

      case 'dataPosts.idCurrentPost': renderModal(elements, state);
        break;

      case 'dataPosts.openedPosts': renderResult(elements, state, i18next);
        break;

      default: console.log('error default');
    }
  });

  return watchedState;
};
