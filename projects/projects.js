import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const titleElement = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let query = '';
let selectedIndex = -1;          
let searchFiltered = projects;   
let currentData = [];
let colors = d3.scaleOrdinal(d3.schemeTableau10);

function setQuery(newQuery) {
  query = newQuery;
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

function renderVisibleProjects() {
  if (selectedIndex === -1) {
    renderProjects(searchFiltered, projectsContainer, 'h2');
  } else {
    let selectedYear = currentData[selectedIndex].label;
    let yearFiltered = searchFiltered.filter(
      (project) => project.year === selectedYear,
    );
    renderProjects(yearFiltered, projectsContainer, 'h2');
  }
}

function updateSelection() {
  d3.select('svg')
    .selectAll('path')
    .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

  d3.select('.legend')
    .selectAll('li')
    .attr('class', (_, idx) =>
      idx === selectedIndex ? 'legend-item selected' : 'legend-item',
    );
}

function renderPieChart(projectsGiven) {
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  let newData = newRolledData
    .map(([year, count]) => ({ value: count, label: year }))
    .sort((a, b) => d3.ascending(a.label, b.label));
  currentData = newData;   

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  let svg = d3.select('svg');
  svg.selectAll('path').remove();
  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  newArcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        updateSelection();
        renderVisibleProjects();
      });
  });

  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });

  updateSelection();
}

if (titleElement) {
  titleElement.textContent = `${projects.length} Projects`;
}
renderPieChart(projects);
renderVisibleProjects();

searchInput.addEventListener('input', (event) => {
  searchFiltered = setQuery(event.target.value);
  selectedIndex = -1;  
  renderPieChart(searchFiltered);
  renderVisibleProjects();
});