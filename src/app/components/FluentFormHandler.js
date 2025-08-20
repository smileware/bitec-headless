'use client';

import { useEffect, useRef } from 'react';

export default function FluentFormHandler() {
    const initializedForms = useRef(new Set());

    useEffect(() => {
        // Set up global form handler
        const handleFormSubmission = async (e) => {
            e.preventDefault();
            
            const form = e.target;
            const formId = form.getAttribute('data-form_id') || form.querySelector('[name="form_id"]')?.value;
            
            if (!formId) {
                console.warn('No FluentForm ID found');
                return;
            }

            // Clear previous messages and error states
            clearPreviousMessages(form);
            clearFieldErrors(form);

            const submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
            }

            try {
                // Collect form data
                const formData = new FormData(form);
                const data = new URLSearchParams(formData).toString();

                // Submit to WordPress
                const response = await fetch('/api/fluentform-submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        data, 
                        form_id: formId, 
                        action: 'fluentform_submit' 
                    })
                });

                const result = await response.json();

                if (result.success && result.data) {
                    // Handle successful submission
                    handleSuccessResponse(form, result.data);
                } else {
                    // Handle error response
                    handleErrorResponse(form, result);
                }

            } catch (error) {
                // Handle network/parsing errors
                showErrorMessage(form, 'Network error. Please check your connection and try again.');
                console.error('FluentForm submission error:', error);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
            }
        };

        // Clear previous error/success messages
        function clearPreviousMessages(form) {
            const existingMessages = form.parentNode.querySelectorAll('.ff-message-success, .ff-message-error');
            existingMessages.forEach(msg => msg.remove());
        }

        // Clear field error states
        function clearFieldErrors(form) {
            // Remove error classes from fields
            form.querySelectorAll('.ff-el-is-error').forEach(field => {
                field.classList.remove('ff-el-is-error');
            });
            
            // Remove error text elements
            form.querySelectorAll('.ff-field-error').forEach(error => {
                error.remove();
            });
        }

        // Handle successful form submission
        function handleSuccessResponse(form, responseData) {
            const message = responseData.data.result?.message || 'Form submitted successfully!';
            
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'ff-message-success';
            successDiv.style.cssText = 'background: #d4edda; color: #155724; padding: 12px; margin: 10px 0; border: 1px solid #c3e6cb; border-radius: 4px;';
            successDiv.innerHTML = message;
            form.parentNode.insertBefore(successDiv, form.nextSibling);
            
            // Handle redirect if specified
            if (responseData.result?.redirectUrl) {
                setTimeout(() => {
                    window.location.href = responseData.result.redirectUrl;
                }, 1500);
            } else {
                // Reset form
                form.reset();
                
                // Hide form if configured to do so
                if (responseData.result?.action === 'hide_form') {
                    form.style.display = 'none';
                }
            }
        }

        // Handle form submission errors
        function handleErrorResponse(form, result) {
            // Check if we have specific field errors from WordPress
            if (result.data && result.data.errors) {
                console.log('result.data.errors', result.data.errors);
                const hasFieldErrors = showFieldErrors(form, result.data.errors);
                
                // Only show general message if no field-specific errors were found
                if (!hasFieldErrors && result.data.message) {
                    showErrorMessage(form, result.data.message);
                }
            } else if (result.data && result.data.message) {
                // Show general error message from WordPress
                showErrorMessage(form, result.data.message);
            } else {
                // Fallback error message
                showErrorMessage(form, result.message || 'Please correct the errors and try again.');
            }
        }

        // Show field-specific errors
        function showFieldErrors(form, errors) {
            let hasErrors = false;
            
            Object.entries(errors).forEach(([fieldName, messages]) => {
                // Find the field element
                const field = form.querySelector(`[name="${fieldName}"]`);
                
                if (field) {
                    // Add error class to field container
                    const fieldContainer = field.closest('.ff-el-group, .form-group') || field.parentElement;
                    fieldContainer.classList.add('ff-el-is-error');
                    
                    // Add error class to the field itself
                    field.classList.add('ff-el-is-error');
                    
                    // Create error message element
                    const errorElement = document.createElement('div');
                    errorElement.className = 'ff-field-error';
                    
                    // Handle different error message formats
                    let errorText = '';
                    if (Array.isArray(messages)) {
                        errorText = messages.join(', ');
                    } else if (typeof messages === 'string') {
                        errorText = messages;
                    } else if (typeof messages === 'object' && messages !== null) {
                        // Handle object format - extract values or convert to string
                        if (messages.message) {
                            errorText = messages.message;
                        } else {
                            errorText = Object.values(messages).join(', ');
                        }
                    } else {
                        errorText = String(messages);
                    }
                    
                    errorElement.textContent = errorText;
                    
                    // Insert error message after the field
                    field.parentNode.insertBefore(errorElement, field.nextSibling);
                    
                    hasErrors = true;
                }
            });
            
            // Don't show general error message - only field-specific errors
            return hasErrors;
        }

        // Show general error message
        function showErrorMessage(form, message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'ff-message-error';
            errorDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 12px; margin: 10px 0; border: 1px solid #f5c6cb; border-radius: 4px;';
            errorDiv.innerHTML = message;
            form.parentNode.insertBefore(errorDiv, form);
        }

        // Helper function to check if a form is already initialized
        const isFormInitialized = (form) => {
            return initializedForms.current.has(form);
        };

        // Helper function to mark a form as initialized
        const markFormAsInitialized = (form) => {
            initializedForms.current.add(form);
        };

        // Watch for new forms being added to the DOM
        const observer = new MutationObserver(() => {
            // Find all FluentForm forms that haven't been initialized
            document.querySelectorAll('form[data-form_id]').forEach(form => {
                if (!isFormInitialized(form)) {
                    markFormAsInitialized(form);
                    form.addEventListener('submit', handleFormSubmission);
                }
            });
        });

        // Start observing
        observer.observe(document.body, { childList: true, subtree: true });

        // Initialize existing forms
        document.querySelectorAll('form[data-form_id]').forEach(form => {
            if (!isFormInitialized(form)) {
                markFormAsInitialized(form);
                form.addEventListener('submit', handleFormSubmission);
            }
        });

        return () => observer.disconnect();
    }, []);

    return null;
} 