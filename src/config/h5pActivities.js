// Central definition of H5P activities
export const H5P_ACTIVITIES = [
  {
    slug: 'koha',
    title: 'Estate Planning Awareness – Conventional & Islamic (Malaysia)',
    summary: 'Interactive book on estate planning awareness for Malaysia, covering both conventional and Islamic perspectives.',
    embedType: 'iframe',
    debug: true
  },
  {
    slug: 'my-interactive',
    title: 'Blackcurrant Quiz',
    summary: 'Simple multiple choice question rendered from local H5P package.'
  },
  {
    slug: 'fill-in-the-blanks',
    title: 'Fill in the Blanks',
    summary: 'Interactive fill-in-the-blanks activity rendered from local H5P package.'
  },
  {
    slug: 'animal-world',
    title: 'Animal World',
    summary: 'Explore the fascinating world of animals with this interactive activity.'
  },
	{
    slug: 'answer-the-question',
    title: 'Answer the Question',
    summary: 'Interactive activity to answer questions rendered from local H5P package.'
  }
];

export const H5P_PLAYER_BASE = import.meta.env.VITE_H5P_PLAYER_BASE || '/assets/h5p-player';
export const H5P_CONTENT_BASE = import.meta.env.VITE_H5P_CONTENT_BASE || '/h5p';