import { GraphQLClient, gql } from 'graphql-request';

const endpoint = process.env.API_DOMAIN || 'http://bitec.local/graphql';
export const graphQLClient = new GraphQLClient(endpoint);

export async function getSiteInfo() {
  const query = gql`
    query SiteInfo {
      generalSettings {
        title
        description
      }
    }
  `;
  const data = await graphQLClient.request(query);
  return data.generalSettings;
}

export async function getGlobalStyle() {
  const query = gql`
    query GlobalCss {
      sMobileCssUrl
      sDesktopCssUrl
      globalInlineCss
    }
  `;
  const data = await graphQLClient.request(query);
  return data;
}


export async function getPageBySlug(slug, language = null) {
  // Get everything from GraphQL
  const query = gql`
    query($uri: String!) {
      pageBy(uri: $uri) {
        id
        slug
        content
        greenshiftInlineCss
        enqueuedScripts(first: 100) {
          edges {
            node {
              src
              after
            }
          }
        }
        translations {
          id
          slug
          content
          greenshiftInlineCss
        }
      }
    }
  `;
  
  const variables = { uri: slug };
  const data = await graphQLClient.request(query, variables);
  const page = data.pageBy;
  
  if (!page) return null;
  
  // Get scripts from GraphQL
  const greenshiftScripts = getGreenshiftScripts(page.enqueuedScripts?.edges || []);
  
  // For Thai language, just replace content with REST API
  if (language === 'th') {
    const thaiContent = await getThaiContent(slug);
    if (thaiContent) {
      page.translations[0].content = thaiContent;
    }
  }
  return {
    ...page,
    greenshiftScripts
  };
}

// Simple function to get Thai content from REST API
async function getThaiContent(slug) {
  try {
    const restEndpoint = (process.env.API_DOMAIN || 'http://bitec.local').replace('/graphql', '');
    
    // For homepage, use 'home' instead of '/'
    const pageSlug = slug === '/' ? 'home' : slug;
    const restUrl = `${restEndpoint}/wp-json/wp/v2/pages?slug=${pageSlug}&lang=th`;
    const response = await fetch(restUrl);
    if (response.ok) {
      const pages = await response.json();
      if (pages && pages.length > 0) {
        return pages[0].content.rendered;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching Thai content:', error);
    return null;
  }
}


// Get only greenshift plugin scripts
export function getGreenshiftScripts(edges) {
  const scripts = [];
  
  edges.forEach(({ node }) => {
    const { src } = node;
    
    if (src && src.includes('greenshift-animation-and-page-builder-blocks')) {
      scripts.push(src);
    }
  });
  
  return scripts;
}