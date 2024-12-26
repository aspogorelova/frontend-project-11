import onChange from 'on-change';

const renderContentPage = (els, i18next) => {
  els.headerPage.textContent = i18next.t('contentPage.headerPage');
  els.preheader.textContent = i18next.t('contentPage.preheader');
  els.placeholder.textContent = i18next.t('contentPage.placeholder');
  els.btnPrimary.textContent = i18next.t('contentPage.button');
  els.example.textContent = i18next.t('contentPage.example');
  els.footer.innerHTML = i18next.t('contentPage.footer');
};

// ИНПУТ
const renderResultCheckedInput = (els, state, i18next) => {
  if (state.form.isValid === true) {
    // console.log('SUCCESS in render result checked input');
    els.feedback.textContent = '';
    els.feedback.classList.remove('text-danger');
    els.input.classList.remove('is-invalid');
    els.feedback.classList.add('text-success');
  } else {
    // console.log('ERROR in renderResultCheckedInput');
    els.feedback.textContent = i18next.t(`feedback.${state.form.error}`);
    els.input.classList.add('is-invalid');
    els.feedback.classList.add('text-danger');
    els.feedback.classList.remove('text-success');
  }
};

// РЕЗУЛЬТАТ
const renderResult = (els, state, i18next) => {
  renderResultCheckedInput(els, state, i18next);

  // Блокируем кнопку на время загрузки данных
  if (state.loadingProccess.status === 'load') {
    // console.log('LOAD');
    els.input.value = '';
    els.btnPrimary.disabled = true;
  };

  if (state.loadingProccess.status === 'success') {
    // Рисуем колонку с постами. Заголовок Посты
  els.posts.innerHTML = '';
  const divCardPost = document.createElement('div');
  divCardPost.classList.add('card', 'border-0');
  els.posts.append(divCardPost);
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
  state.dataPosts.listPosts.map((post) => {
    console.log('post id  ', post.idPost);
    const li = document.createElement('li');
    li.setAttribute('id', post.idPost);
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    link.classList.add('fw-bold');
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
  els.feeds.innerHTML = '';
  const divCardFeeds = document.createElement('div');
  divCardFeeds.classList.add('card', 'border-0');
  els.feeds.append(divCardFeeds);
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
  state.dataFeeds.map((feed) => {
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
    ulFeeds.append(li);
  });
  divCardBodyFeeds.append(ulFeeds);
  els.btnPrimary.disabled = false;
  els.feedback.textContent = i18next.t('feedback.success');
};
}

// АПГРЕЙД
const renderUpgrade = (els, state, i18next) => {
  const listPosts = document.querySelector('ul.list-group');
  const oldPosts = document.querySelectorAll('li.post-');
  console.log('old posts in upgrade  ', oldPosts);
  const newPostsForUpgrade = state.dataPosts.listPosts.filter((post) => {
    
  });
  state.dataPosts.newPostsForUpgrade.map((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    link.classList.add('fw-bold');
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
    listPosts.prepend(li);
  });

}

export default (elements, state, i18next) => {
  const watchedState = onChange(state, (path, value) => {
    console.log('STATE in render start ', state);
    // console.log('PATH, value in render ', path, value);
    renderContentPage(elements, i18next);

    switch (path) {
      case 'form.error':
        renderResultCheckedInput(elements, state, i18next);
        break;

      case 'loadingProccess.status': renderResult(elements, state, i18next);
      break;

      case 'dataPosts.statusUpgrade': renderUpgrade(elements, state, i18next);
      break;

      default: 'error';
        break;
    }
  });

  return watchedState;
};
