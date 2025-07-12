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


export async function getPageBySlug(slug) {
  // Always use the base slug without language prefix for GraphQL
  let uri = slug;
  
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
  const variables = { uri };
  const data = await graphQLClient.request(query, variables);
  const page = data.pageBy;
  if (!page) return null;
  
  // Get only greenshift scripts
  const greenshiftScripts = getGreenshiftScripts(page.enqueuedScripts?.edges || []);
  
  return {
    ...page,
    greenshiftScripts
  };
}

// Get only greenshift plugin scripts
function getGreenshiftScripts(edges) {
  const scripts = [];
  
  edges.forEach(({ node }) => {
    const { src } = node;
    
    if (src && src.includes('greenshift-animation-and-page-builder-blocks')) {
      scripts.push(src);
    }
  });
  
  return scripts;
}