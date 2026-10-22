console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"
  : "/portfolio/";

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'Resume'},
  { url: 'contact/', title: 'Contact'},
  { url: 'https://github.com/Minh24y5', title: 'GitHub'}
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  url = !url.startsWith('http') ? BASE_PATH + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname,
  );

  a.toggleAttribute(
    'target',
    a.host !== location.host
  );
  if (a.host !== location.host) {
    a.target = '_blank';
  }

  nav.append(a);
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select>
			<option value="light dark">Automatic</option>
			<option value="light">Light</option>
			<option value="dark">Dark</option>
		</select>
	</label>`,
);

let select = document.querySelector('.color-scheme select');

select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  document.documentElement.style.setProperty('color-scheme', event.target.value);
  localStorage.colorScheme = event.target.value;
});

if ("colorScheme" in localStorage) {
  let savedScheme = localStorage.colorScheme;
  document.documentElement.style.setProperty('color-scheme', savedScheme);
  select.value = savedScheme;
}

let form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
  event.preventDefault();

  let data = new FormData(form);
  let params = [];

  for (let [name, value] of data) {
    params.push(`${name}=${encodeURIComponent(value)}`);
  }

  let url = form.action + '?' + params.join('&');

  location.href = url;
});

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!(containerElement instanceof Element)) {
    console.error('renderProjects: containerElement is not a valid DOM element');
    return;
  }

  if (!projects) {
    console.error('renderProjects: no project data provided');
    return;
  }
  const list = Array.isArray(projects) ? projects : [projects];

  const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!validHeadings.includes(headingLevel)) {
    console.warn(`Invalid headingLevel "${headingLevel}", falling back to h2`);
    headingLevel = 'h2';
  }

  containerElement.innerHTML = '';

  for (const project of list) {
    const article = document.createElement('article');

    article.innerHTML = `
      <${headingLevel}>${project.title ?? 'Untitled project'}</${headingLevel}>
      ${project.image ? `<img src="${project.image}" alt="${project.title ?? ''}">` : ''}
      <p>${project.description ?? ''}</p>
      ${project.year ? `<time class="project-year" datetime="${project.year}">c. ${project.year}</time>` : ''}
    `;

    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}