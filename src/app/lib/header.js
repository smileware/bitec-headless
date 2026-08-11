import { GraphQLClient, gql } from 'graphql-request';
import { unstable_cache } from 'next/cache';

const endpoint = process.env.API_DOMAIN || 'https://wordpress-1328545-5763448.cloudwaysapps.com/graphql';
// Accept: */* required — the host WAF 403s application/json & the graphql-request
// v7 default. See the note in lib/api.js.
export const client = new GraphQLClient(endpoint, { headers: { Accept: '*/*' } });

// The Cloudways WordPress GraphQL endpoint is intermittently slow/unresponsive.
// A bare client.request() can hang for 2+ minutes with no timeout. This wraps a
// request with an abort-based timeout and a single retry so a transient failure
// throws quickly instead of hanging — and, critically, so it THROWS rather than
// returning empty data (empty data would get cached and hide the nav for
// 5-30 min). See getHeaderData below.
async function requestWithRetry(query, variables, { timeoutMs = 8000, retries = 1 } = {}) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            return await client.request({ document: query, variables, signal: controller.signal });
        } catch (error) {
            lastError = error;
        } finally {
            clearTimeout(timer);
        }
    }
    throw lastError;
}

// Server-side function to fetch all header data in one query (CACHED).
// If the underlying fetch throws, unstable_cache does NOT cache the rejection,
// so the next request retries the endpoint instead of serving a poisoned
// (empty) header. The caller (SiteHeader / Suspense) is responsible for a
// graceful fallback when this rejects.
export async function getHeaderData(language = 'en') {
    // Use unstable_cache to cache header data (menus don't change often)
    return unstable_cache(
        async () => {
            return await fetchHeaderDataFromGraphQL(language);
        },
        [`header-data-${language}`],
        {
            revalidate: 30 * 60, // Cache for 30 minutes (menus rarely change)
            tags: ['header-menu'],
        }
    )();
}

// Internal function to actually fetch from GraphQL
async function fetchHeaderDataFromGraphQL(language = 'en') {
    const primaryMenuId = language === 'th' ? 12 : 3;
    const topMenuId = language === 'th' ? 13 : 4;
    const mobileMenuId = language === 'th' ? 16 : 15;

    const query = gql`
        query GetHeaderData($primaryMenuId: ID!, $topMenuId: ID!, $mobileMenuId: ID!) {
            # Primary Menu
            primaryMenu: menu(id: $primaryMenuId, idType: DATABASE_ID) {
                id
                name
                menuItems(first: 100) {
                    nodes {
                        id
                        label
                        url
                        path
                        parentId
                        menuItemIcon {
                            menuIcon
                        }
                        cssClasses
                    }
                }
            }
            # Top Menu
            topMenu: menu(id: $topMenuId, idType: DATABASE_ID) {
                name
                menuItems(first: 100) {
                    nodes {
                        id
                        label
                        url
                        path
                        menuItemIcon {
                            menuIcon
                        }
                    }
                }
            }
            # Mobile Menu
            mobileMenu: menu(id: $mobileMenuId, idType: DATABASE_ID) {
                id
                name
                menuItems(first: 100) {
                    nodes {
                        id
                        label
                        url
                        path
                        parentId
                        menuItemIcon {
                            menuIcon
                        }
                        cssClasses
                    }
                }
            }
            # CTA Data
            themeGeneralSettings {
              callToActionButtons {
                requestAProposal {
                  target
                  title
                  url
                }
                getInTouchLabel
                getInTouch {
                  ctaLink {
                    target
                    title
                    url
                  }
                  ctaIcon
                }
                fieldGroupName
                getInTouchLabelThai
                getInTouchThai {
                  ctaLink {
                    target
                    title
                    url
                  }
                  ctaIcon
                }
                requestAProposalThai {
                  target
                  title
                  url
                }
              }
            }
        }
    `;

    const variables = { 
        primaryMenuId, 
        topMenuId, 
        mobileMenuId 
    };

    const data = await requestWithRetry(query, variables);

    // Treat a response with no primary menu items as a failure too — a "success"
    // with empty menus would otherwise get cached and hide the nav. Throw so the
    // cache stays unpoisoned and the next request retries.
    const primaryItems = data.primaryMenu?.menuItems?.nodes || [];
    if (primaryItems.length === 0) {
        throw new Error('Header GraphQL returned no primary menu items');
    }

    return {
        primaryMenu: {
            menuItems: primaryItems
        },
        topMenu: {
            menuTopItems: data.topMenu?.menuItems?.nodes || []
        },
        mobileMenu: {
            menuMobileItems: data.mobileMenu?.menuItems?.nodes || []
        },
        cta: data.themeGeneralSettings
    };
}

export async function getPrimaryMenu(language = 'en') {
    // Use menu ID based on language
    const menuId = language === 'th' ? 12 : 3;
    
    const query = gql`query GetPrimaryMenu($menuId: ID!) {
        menu(id: $menuId, idType: DATABASE_ID) {
          id
          name
          menuItems(first: 100) {
            nodes {
                id
                label
                url
                path
                parentId
            }
          }
        }
      }
    `;

    const variables = { menuId: menuId };
    const data = await client.request(query, variables);
    const menuItems = data.menu?.menuItems?.nodes || [];
    return {
      menuItems: menuItems
    };
}

export async function getMobileMenu(language = 'en') {
  const menuId = language === 'th' ? 16 : 15;
  const query = gql`query GetMobileMenu($menuId: ID!) {
      menu(id: $menuId, idType: DATABASE_ID) {
        id
        name
        menuItems(first: 100) {
          nodes {
              id
              label
              url
              path
              parentId
              menuItemIcon {
                menuIcon
              }
              cssClasses
          }
        }
      }
    }
  `;

  const variables = { menuId: menuId };
  const data = await client.request(query, variables);
  const menuMobileItems = data.menu?.menuItems?.nodes || [];
  return {
    menuMobileItems: menuMobileItems
  };
}

export async function getTopMenu(language = 'en') {
    // Use menu ID based on language
    const menuId = language === 'th' ? 13 : 4;
    const query = gql`
      query GetTopMenu($menuId: ID!) {
        menu(id: $menuId, idType: DATABASE_ID) {
          name
          menuItems(first: 100) {
            nodes {
              id
              label
              url
              path
            }
          }
        }
      }
    `;

    const variables = { menuId: menuId };
    const data = await client.request(query, variables);
    const menuTopItems = data.menu?.menuItems?.nodes || [];
    return {
      menuTopItems: menuTopItems
    };
}

export async function getCTA() {
    const query = gql`
      query GetCTA {
        themeGeneralSettings {
          callToActionButtons {
            requestAProposal {
              target
              title
              url
            }
            getInTouch {
              target
              title
              url
            }
            fieldGroupName
            getInTouchThai {
              target
              title
              url
            }
            requestAProposalThai {
              target
              title
              url
            }
          }
        }
      }
    `;

    const data = await client.request(query);
    return data.themeGeneralSettings || {};
}

