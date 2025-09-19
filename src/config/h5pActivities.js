// Central definition of H5P activities
export const H5P_ACTIVITIES = [
  {
    slug: 'koha',
    title: 'Estate Planning Awareness – Conventional & Islamic (Malaysia)',
    summary: 'Interactive book on estate planning awareness for Malaysia, covering both conventional and Islamic perspectives.',
    embedType: 'div',
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
  },
  // --- New H5P activities below ---
  {
    slug: 'course-presentation-1292697122536488879',
    title: 'Course Presentation',
    summary: 'A course presentation with interactive slides and activities.',
    embedType: 'iframe'
  },
 

  {
    slug: 'Introduction to Time Management',
    title: 'Introduction to Time Management',
    summary: 'Branching scenario on time management skills.',
    embedType: 'iframe'
  },
  {
    slug: 'test-1292696978100675539',
    title: 'test',
    summary: 'Interactive video with embedded questions.',
    embedType: 'iframe'
  },
  {
    slug: 'What Would You Do',
    title: 'What Would You Do?',
    summary: 'Branching scenario: What Would You Do?',
    embedType: 'iframe'
  }
  ,
  {
    slug: 'column',
    title: 'Example: Column',
    summary: 'A column activity with multiple interactive elements.',
    embedType: 'iframe'
  },
  {
    slug: 'resource-for-presenting-h5p-1292697191836419139',
    title: 'Resource for presenting H5P',
    summary: 'A course presentation resource with interactive slides.',
    embedType: 'iframe'
  }
];

export const H5P_PLAYER_BASE = import.meta.env.VITE_H5P_PLAYER_BASE || '/assets/h5p-player';
export const H5P_CONTENT_BASE = import.meta.env.VITE_H5P_CONTENT_BASE || '/h5p';