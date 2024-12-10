const renderContentPage = (els, i18next) => {
  // console.log('render start page  ', els);
  els.headerPage.textContent = i18next.t('contentPage.headerPage');
  els.preheader.textContent = i18next.t('contentPage.preheader');
  els.placeholder.textContent = i18next.t('contentPage.placeholder');
  els.btnPrimary.textContent = i18next.t('contentPage.button');
  els.example.textContent = i18next.t('contentPage.example');
  els.footer.innerHTML = i18next.t('contentPage.footer');
};

// ИНПУТ
const renderInput = (els, state, i18next) => {
  if (state.inputUi === true) {
    console.log('SUCCESS in renderInput');
    els.feedback.textContent = i18next.t('feedback.success');
    els.feedback.classList.remove('text-danger');
    els.feedback.classList.add('text-success');
    els.input.classList.remove('is-invalid');
  } else {
    console.log('ERROR in renderInput');
    els.input.classList.add('is-invalid');
    els.feedback.classList.add('text-danger');
    els.feedback.classList.remove('text-success');
  }

};

// РЕЗУЛЬТАТ
const renderResult = (els, val, state, i18next) => {
  console.log('GOOD');
  // Рисуем колонку с постами. Заголовок Посты
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
  const arrPosts = [{ namePost: 'Пост о чем-то важном', href: '#' }, { namePost: 'Еще один важный пост', href: '#' }, { namePost: 'Последний пост о котиках', href: '#' }];
  const listPost = arrPosts.map((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.setAttribute('href', post.href);
    link.setAttribute('target', '_blank');
    link.textContent = post.namePost;
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
  const arrFeeds = [
    {
      link: 'https://aljazeera.com/xml/rss/all.xml',
      feed: { nameFeed: 'Что-то о чем-то', describeFeed: 'Что-то с чем-то' },
    },
    {
      link: 'https://thecipherbrief.com/feed',
      feed: { nameFeed: 'Котиков все любят', describeFeed: 'А кто не любит, тот дурак' },
    },
  ];
  arrFeeds.map(({ nameFeed, describeFeed }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const headerFeed = document.createElement('h3');
    headerFeed.classList.add('h6', 'm-0');
    headerFeed.textContent = nameFeed;
    const textFeed = document.createElement('p');
    textFeed.classList.add('m-0', 'small', 'text-black-50');
    textFeed.textContent = describeFeed;
    li.append(headerFeed);
    li.append(textFeed);
    ulFeeds.append(li);
  });
  divCardBodyFeeds.append(ulFeeds);

  renderInput(els, state, i18next);
};

// ОШИБКИ
const renderError = (els, val, state, i18next) => {
  console.log('VAL in renderError  ', val);

  // Нет ошибки
  if (val === '') {
    renderInput(els, state);
  }

  // Есть ошибка
  if (val !== '') {
    els.feedback.textContent = i18next.t(`feedback.${state.form.error}`);
    renderInput(els, state);
  }
};

export default (elements, state, i18next) => (path, value) => {
  console.log('STATE  ', state);
  console.log('PATH, value in render ', path, value);
  renderContentPage(elements, i18next);

  switch (path) {
    case 'form.error':
      renderError(elements, value, state, i18next);
      break;

    case 'form':
      console.log('path in inputUi  ', path);
      renderResult(elements, value, state, i18next);
      break;

    default: 'error';
      break;
  }
};
