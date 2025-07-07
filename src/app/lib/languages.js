import { GraphQLClient, gql } from 'graphql-request';

const endpoint = process.env.API_DOMAIN || 'http://bitec.local/graphql';
const client = new GraphQLClient(endpoint);

export async function getWPMLLanguages() {
  const query = gql`
    query GetWPMLLanguages {
      languages {
        code
        country_flag_url
        default_locale
        id
        language_code
        native_name
        translated_name
        url
      }
    }
  `;

  try {
    const data = await client.request(query);
    return data.languages || [];
  } catch (error) {
    console.error('Error fetching languages:', error);
    return [];
  }
}

export async function getCurrentPageTranslations(slug) {
  const query = gql`
    query GetPageTranslations($slug: String!) {
      pageBy(uri: $slug) {
        translations {
          code
          name
          uri
          slug
        }
      }
    }
  `;

  try {
    const data = await client.request(query, { slug });
    return data.pageBy?.translations || [];
  } catch (error) {
    console.error('Error fetching page translations:', error);
    return [];
  }
} 