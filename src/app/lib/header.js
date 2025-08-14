import { GraphQLClient, gql } from 'graphql-request';

const endpoint = process.env.API_DOMAIN || 'https://wordpress-1328545-5763448.cloudwaysapps.com/graphql';
export const client = new GraphQLClient(endpoint);

// Server-side function to fetch all header data in one query
export async function getHeaderData(language = 'en') {
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

    const variables = { 
        primaryMenuId, 
        topMenuId, 
        mobileMenuId 
    };

    try {
        const data = await client.request(query, variables);
        
        return {
            primaryMenu: {
                menuItems: data.primaryMenu?.menuItems?.nodes || []
            },
            topMenu: {
                menuTopItems: data.topMenu?.menuItems?.nodes || []
            },
            mobileMenu: {
                menuMobileItems: data.mobileMenu?.menuItems?.nodes || []
            },
            cta: data.themeGeneralSettings
        };
    } catch (error) {
        console.error('Error fetching header data:', error);
        return {
            primaryMenu: { menuItems: [] },
            topMenu: { menuTopItems: [] },
            mobileMenu: { menuMobileItems: [] },
            cta: null
        };
    }
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

