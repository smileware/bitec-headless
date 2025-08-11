export async function POST(request) {
    try {
        const body = await request.json();
        const { data, form_id, action } = body;

        // WordPress site URL - adjust this to match your WordPress installation
        const wordpressUrl = process.env.API_DOMAIN?.replace('/graphql', '') || 'https://wordpress-1328545-5763448.cloudwaysapps.com/graphql';
        const wpAjaxUrl = `${wordpressUrl}/wp-admin/admin-ajax.php`;

        console.log('FluentForm submission:', { form_id, action });

        // Forward the request to WordPress
        const response = await fetch(wpAjaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                // Forward any relevant headers
                'User-Agent': request.headers.get('user-agent') || 'NextJS-FluentForm-Handler',
                'X-Forwarded-For': getClientIP(request),
            },
            body: new URLSearchParams({
                action: action || 'fluentform_submit',
                form_id: form_id,
                data: data
            }).toString()
        });

        console.log('WordPress response status:', response.status);
        const responseText = await response.text();
        console.log('WordPress raw response:', responseText);

        // Try to parse JSON response
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse WordPress response as JSON:', parseError);
            return Response.json({
                success: false,
                message: 'Invalid response from WordPress',
                data: { message: 'Server configuration error' }
            }, { status: 500 });
        }

        // Handle WordPress response
        if (response.ok) {
            // WordPress returned 200, but check if FluentForm reported success
            if (result.success === false) {
                // FluentForm validation failed
                console.log('FluentForm validation errors:', result.errors);
                return Response.json({
                    success: false,
                    message: 'Validation failed',
                    data: {
                        errors: result.errors || {},
                        message: result.message || 'Please correct the errors and try again.'
                    }
                });
            } else {
                // FluentForm success
                console.log('FluentForm success:', result);
                return Response.json({
                    success: true,
                    data: result,
                    message: 'Form submitted successfully'
                });
            }
        } else {
            // WordPress returned an HTTP error
            console.error('WordPress HTTP error:', response.status, response.statusText);
            return Response.json({
                success: false,
                message: 'Failed to submit form to WordPress',
                data: { 
                    message: `WordPress server error: ${response.status} ${response.statusText}`,
                    errors: result.errors || {}
                }
            }, { status: response.status });
        }

    } catch (error) {
        console.error('FluentForm API error:', error);
        
        return Response.json({
            success: false,
            message: 'Internal server error',
            data: { 
                message: error.message,
                errors: {}
            }
        }, { status: 500 });
    }
}

// Helper function to get client IP
function getClientIP(request) {
    // Check various headers that might contain the real IP
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const xRealIP = request.headers.get('x-real-ip');
    const xClientIP = request.headers.get('x-client-ip');
    
    if (xForwardedFor) {
        // x-forwarded-for can contain multiple IPs, take the first one
        return xForwardedFor.split(',')[0].trim();
    }
    
    if (xRealIP) {
        return xRealIP;
    }
    
    if (xClientIP) {
        return xClientIP;
    }
    
    // Fallback - this might not be accurate in all hosting environments
    return '127.0.0.1';
}

// Handle preflight requests for CORS
export async function OPTIONS(request) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
} 