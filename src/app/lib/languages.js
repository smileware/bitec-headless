import { GraphQLClient, gql } from 'graphql-request';

const endpoint = process.env.API_DOMAIN || 'https://wordpress-1328545-5763448.cloudwaysapps.com/graphql';
// Accept: */* required — the host WAF 403s application/json & the graphql-request
// v7 default. See the note in lib/api.js.
const client = new GraphQLClient(endpoint, { headers: { Accept: '*/*' } });

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