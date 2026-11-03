$(function () {
    'use strict';
    console.log("jQuery is ready!");

    const fallbackProductNames = [
        'Nike', 'Adidas', 'Jordan', 'New Balance', 'Puma',
        'Air Nitro 2026', 'Urban Glide X', 'Retro Street High',
        'Street Flex Women', 'Nova Trail Runner', 'Junior Sprint',
        'Air Runner Pro', 'Urban Sport High', 'Flex Soft Rose',
        'Cloud Foam White', 'Mini Runner V2', 'Junior Flash Light'
    ];

    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Task 1: Product search, filter and result count
    function initLiveSearch() {
        const $searchInput = $('#productSearch');
        const $cards = $('[data-product-card]');
        if (!$searchInput.length || !$cards.length) {
            return;
        }

        const $count = $('#productCount');
        const $emptyState = $('#productEmptyState');
        const $filter = $('#productFilter');

        function passesCatalogFilter() {
            const filterValue = $filter.length ? $filter.val() : 'all';
            const price = Number($(this).attr('data-price')) || 0;
            const isNew = $(this).attr('data-new') === 'true';
            const isSale = $(this).attr('data-sale') === 'true';

            switch (filterValue) {
                case 'new':
                    return isNew;
                case 'sale':
                    return isSale;
                case 'under-140':
                    return price < 140;
                default:
                    return true;
            }
        }

        function updateProducts() {
            const query = ($searchInput.val() || '').trim().toLowerCase();
            const $matches = $cards.filter(function () {
                const title = $(this).find('.card-title').first().text().trim().toLowerCase();
                return (!query || title.includes(query)) && passesCatalogFilter.call(this);
            });

            $cards.prop('hidden', true);
            $matches.prop('hidden', false);

            if ($count.length) {
                const resultCount = $matches.length;
                $count.text(resultCount + ' product' + (resultCount === 1 ? '' : 's') + ' found');
            }

            if ($emptyState.length) {
                $emptyState.toggleClass('d-none', $matches.length > 0);
            }
        }

        $searchInput.on('input keyup', updateProducts);
        $filter.on('change', updateProducts);
        $(document).on('click', '.product-search-clear', function () {
            const $input = $(this).closest('.product-search-wrap').find('.product-search');
            $input.val('').trigger('input').trigger('focus');
        });

        updateProducts();
    }

    // Task 2: Accessible product autocomplete
    function initAutocomplete() {
        const $searchInput = $('#productSearch');
        const $suggestions = $('#productSuggestions');
        if (!$searchInput.length || !$suggestions.length) {
            return;
        }

        $searchInput.attr('role', 'combobox')
            .attr('aria-autocomplete', 'list')
            .attr('aria-haspopup', 'listbox');

        const productNames = Array.from(new Set(
            $('.card-title').map(function () {
                return $(this).text().trim();
            }).get().concat(fallbackProductNames)
        ));
        const reduceMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let activeIndex = -1;

        function closeSuggestions() {
            $suggestions.empty().hide();
            $searchInput.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
            activeIndex = -1;
        }

        function updateActiveOption() {
            const $options = $suggestions.find('[role="option"]');
            $options.removeClass('active').attr('aria-selected', 'false');
            if (activeIndex < 0 || activeIndex >= $options.length) {
                $searchInput.removeAttr('aria-activedescendant');
                return;
            }

            const $activeOption = $options.eq(activeIndex);
            $activeOption.addClass('active').attr('aria-selected', 'true');
            $searchInput.attr('aria-activedescendant', $activeOption.attr('id'));
        }

        function showSuggestions(value) {
            const query = value.trim().toLowerCase();
            if (!query) {
                closeSuggestions();
                return;
            }

            const matches = productNames.filter(function (name) {
                return name.toLowerCase().includes(query);
            }).slice(0, 6);

            $suggestions.empty();
            if (!matches.length) {
                closeSuggestions();
                return;
            }

            matches.forEach(function (name, index) {
                const $option = $('<button type="button" class="search-suggestion-item" role="option" aria-selected="false"></button>');
                const matchIndex = name.toLowerCase().indexOf(query);
                $option.attr('id', 'product-suggestion-' + index);
                $option.append(document.createTextNode(name.slice(0, matchIndex)));
                $option.append($('<strong>').text(name.slice(matchIndex, matchIndex + query.length)));
                $option.append(document.createTextNode(name.slice(matchIndex + query.length)));
                $option.on('mousedown', function (event) {
                    event.preventDefault();
                    $searchInput.val(name).trigger('input').trigger('focus');
                    closeSuggestions();
                });
                $suggestions.append($option);
            });

            if (reduceMotion) {
                $suggestions.show();
            } else {
                $suggestions.stop(true, true).slideDown(120);
            }
            $searchInput.attr('aria-expanded', 'true');
            activeIndex = -1;
            updateActiveOption();
        }

        $searchInput.on('input', function () {
            showSuggestions($searchInput.val() || '');
        });

        $searchInput.on('keydown', function (event) {
            const $options = $suggestions.find('[role="option"]');
            if (!$options.length) {
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                activeIndex = activeIndex >= $options.length - 1 ? 0 : activeIndex + 1;
                updateActiveOption();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                activeIndex = activeIndex <= 0 ? $options.length - 1 : activeIndex - 1;
                updateActiveOption();
            } else if (event.key === 'Enter' && activeIndex >= 0) {
                event.preventDefault();
                $searchInput.val($options.eq(activeIndex).text()).trigger('input');
                closeSuggestions();
            } else if (event.key === 'Escape') {
                closeSuggestions();
            }
        });

        $(document).on('click', function (event) {
            if (!$(event.target).closest('.product-search-wrap').length) {
                closeSuggestions();
            }
        });

        closeSuggestions();
    }

    // Task 3: FAQ search highlighting in text nodes only
    function initFaqSearch() {
        const $searchInput = $('#faqSearch');
        const $faqItems = $('.faq-item');
        const $summary = $('#faqMatchSummary');
        if (!$searchInput.length || !$faqItems.length) {
            return;
        }

        function unwrapHighlights() {
            $('.search-highlight').each(function () {
                const parent = this.parentNode;
                parent.replaceChild(document.createTextNode(this.textContent), this);
                parent.normalize();
            });
        }

        function highlightTextNodes(element, regex) {
            let matchCount = 0;
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            const textNodes = [];
            let currentNode;

            while ((currentNode = walker.nextNode())) {
                if (currentNode.nodeValue && regex.test(currentNode.nodeValue)) {
                    textNodes.push(currentNode);
                }
                regex.lastIndex = 0;
            }

            textNodes.forEach(function (textNode) {
                const text = textNode.nodeValue;
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                let match;
                regex.lastIndex = 0;

                while ((match = regex.exec(text))) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
                    const mark = document.createElement('mark');
                    mark.className = 'search-highlight';
                    mark.textContent = match[0];
                    fragment.appendChild(mark);
                    lastIndex = match.index + match[0].length;
                    matchCount += 1;
                }

                fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
                textNode.parentNode.replaceChild(fragment, textNode);
            });

            return matchCount;
        }

        function restoreAccordion() {
            $faqItems.show().removeClass('open');
            $faqItems.find('.faq-question').attr('aria-expanded', 'false');
            $faqItems.find('.faq-answer').css('maxHeight', '0px');
        }

        $searchInput.on('input', function () {
            const query = ($searchInput.val() || '').trim();
            unwrapHighlights();

            if (!query) {
                restoreAccordion();
                $summary.text('');
                return;
            }

            const regex = new RegExp(escapeRegExp(query), 'gi');
            let totalMatches = 0;
            let matchedQuestions = 0;

            $faqItems.each(function () {
                const $item = $(this);
                const question = $item.find('.faq-question').get(0);
                const $answer = $item.find('.faq-answer');
                let itemMatches = highlightTextNodes(question, regex);
                $answer.find('p').each(function () {
                    itemMatches += highlightTextNodes(this, regex);
                });

                if (itemMatches) {
                    matchedQuestions += 1;
                    totalMatches += itemMatches;
                    $item.show().addClass('open');
                    $item.find('.faq-question').attr('aria-expanded', 'true');
                    $answer.css('maxHeight', $answer.prop('scrollHeight') + 'px');
                } else {
                    $item.hide().removeClass('open');
                    $item.find('.faq-question').attr('aria-expanded', 'false');
                    $answer.css('maxHeight', '0px');
                }
            });

            if (totalMatches) {
                const questionWord = matchedQuestions === 1 ? 'question' : 'questions';
                $summary.text(totalMatches + ' match' + (totalMatches === 1 ? '' : 'es') +
                    ' in ' + matchedQuestions + ' ' + questionWord);
            } else {
                $summary.text('No FAQ matches');
            }
        });

        restoreAccordion();
    }

    // Task 4: Scroll progress indicator
    function initScrollProgress() {
        if ($('.scroll-progress-track').length) {
            return;
        }

        const reduceMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const $track = $('<div class="scroll-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="scroll-progress-fill"></div><span class="scroll-progress-bubble">0%</span></div>');
        $track.prependTo('body');

        function updateProgress() {
            const scrollableHeight = $(document).height() - $(window).height();
            const currentScroll = $(window).scrollTop();
            const progress = scrollableHeight > 0 ? currentScroll / scrollableHeight * 100 : 0;
            const value = Math.min(100, Math.max(0, progress));
            $track.find('.scroll-progress-fill').css('width', value + '%');
            $track.find('.scroll-progress-bubble').text(Math.round(value) + '%');
            $track.attr('aria-valuenow', Math.round(value));
        }

        if (reduceMotion) {
            $track.find('.scroll-progress-fill').css('transition', 'none');
        }
        $(window).on('scroll resize', function () {
            window.requestAnimationFrame(updateProgress);
        });
        updateProgress();
    }

    // Task 5: Count-up metrics when they enter the viewport
    function initStatsCounter() {
        const $stats = $('.stat-number');
        if (!$stats.length) {
            return;
        }

        function formatNumber(value, decimals, suffix) {
            return Number(value).toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }) + suffix;
        }

        function animateCounter(element) {
            const $element = $(element);
            if ($element.data('animated')) {
                return;
            }
            $element.data('animated', true);

            const target = Number($element.data('target')) || 0;
            const decimals = Number($element.data('decimals')) || 0;
            const suffix = $element.data('suffix') || '';
            if (window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                $element.text(formatNumber(target, decimals, suffix));
                return;
            }

            $({ value: 0 }).animate({ value: target }, {
                duration: 2000,
                easing: 'swing',
                step: function (value) {
                    $element.text(formatNumber(value, decimals, suffix));
                },
                complete: function () {
                    $element.text(formatNumber(target, decimals, suffix));
                }
            });
        }

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.35 });
            $stats.each(function () {
                observer.observe(this);
            });
        } else {
            $stats.each(function () {
                animateCounter(this);
            });
        }
    }

    function showToast(message, type) {
        const toastTypes = {
            success: { icon: '✓' },
            info: { icon: 'ℹ' },
            warning: { icon: '⚠' },
            error: { icon: '✕' }
        };
        const toastType = toastTypes[type] ? type : 'info';
        let $container = $('.toast-stack');
        if (!$container.length) {
            $container = $('<div class="toast-stack" aria-live="polite" aria-relevant="additions"></div>').appendTo('body');
        }

        const $toast = $('<div class="site-toast" role="status"></div>').addClass('toast-' + toastType);
        const $icon = $('<span class="toast-icon" aria-hidden="true"></span>').text(toastTypes[toastType].icon);
        const $content = $('<span class="toast-message"></span>').text(message);
        const $close = $('<button type="button" class="toast-close" aria-label="Close notification">&times;</button>');
        $toast.append($icon, $content, $close).appendTo($container);

        const reduceMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        function removeToast() {
            window.clearTimeout($toast.data('dismiss-timeout'));
            if (reduceMotion) {
                $toast.remove();
            } else {
                $toast.stop(true, true).fadeOut(180, function () {
                    $(this).remove();
                });
            }
        }

        $close.on('click', removeToast);
        if (reduceMotion) {
            $toast.show();
        } else {
            $toast.hide().fadeIn(180);
        }
        $toast.data('dismiss-timeout', window.setTimeout(removeToast, 3000));
    }

    // Task 6: Validate once, show submit spinner, then report success
    function initSubmitSpinners() {
        const forms = [
            { selector: '#contactForm', validators: 'contact', success: '#contactSuccess', kind: 'contact' },
            { selector: '#signupForm', validators: 'signup', success: '#signupSuccess', kind: 'signup' }
        ];

        forms.forEach(function (formConfig) {
            const $form = $(formConfig.selector);
            if (!$form.length) {
                return;
            }

            $form.on('submit', function (event) {
                event.preventDefault();
                if ($form.data('submitting')) {
                    return;
                }

                $(formConfig.success).addClass('d-none');
                const validatorSet = window.KicksLabValidation &&
                    window.KicksLabValidation[formConfig.validators];
                if (!validatorSet) {
                    showToast('Form validation is unavailable. Please reload and try again.', 'error');
                    return;
                }

                const validationResults = Object.keys(validatorSet).map(function (key) {
                    return validatorSet[key]();
                });
                if (!validationResults.every(Boolean)) {
                    return;
                }

                const $button = $form.find('[type="submit"]').first();
                const $success = $(formConfig.success);
                const submittedName = $form.find('[name="name"]').val().trim();
                const successMessage = formConfig.kind === 'contact'
                    ? 'Thanks, ' + submittedName + '! Your message passed validation. This project demo does not connect to a mail server.'
                    : 'Thanks, ' + submittedName + '! This signup demo does not create an account yet.';

                if (!$button.data('original-text')) {
                    $button.data('original-text', $button.text());
                }

                $form.data('submitting', true);
                $button.prop('disabled', true)
                    .html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Please wait…');

                window.setTimeout(function () {
                    $button.text($button.data('original-text')).prop('disabled', false);
                    $form.data('submitting', false);
                    if (window.KicksLabValidation) {
                        window.KicksLabValidation.clearState($form.get(0));
                    }
                    $form.get(0).reset();
                    window.KicksLabValidation.showAlert($success.get(0), successMessage);
                    showToast(successMessage, 'success');

                    if (formConfig.kind === 'signup') {
                        window.setTimeout(function () {
                            $('#signupPopup').removeClass('show');
                            $('body').removeClass('popup-open');
                        }, 2000);
                    }
                }, 1750);
            });
        });
    }

    // Task 7: Shared, dismissible toast notifications
    function initToastActions() {
        $(document).on('click', '[data-cart-action]', function () {
            const $card = $(this).closest('.card');
            const productName = $card.find('.card-title').first().text().trim();
            showToast(productName + ' added to your demo cart.', 'success');
        });

        $(document).on('click', '.rating-star', function () {
            showToast('Thank you for rating KicksLab ' + $(this).data('rating') + ' out of 5 stars!', 'info');
        });
    }

    function fallbackCopy(text) {
        const $textarea = $('<textarea class="copy-fallback" aria-hidden="true"></textarea>')
            .val(text).appendTo('body');
        $textarea.trigger('focus').trigger('select');
        const copied = document.execCommand('copy');
        $textarea.remove();
        if (!copied) {
            throw new Error('The browser could not copy the selected text.');
        }
    }

    // Task 8: Promo snippets with copy feedback
    function initCopyButtons() {
        $('.copy-snippet').on('copy', function () {
            showToast('Promo details copied to clipboard.', 'info');
        });

        $('.copy-button').on('click', function () {
            const $button = $(this);
            const $item = $button.closest('.copy-item');
            const $snippet = $item.find('.copy-snippet');
            const value = $snippet.attr('data-copy-value') || $snippet.text().trim();
            const $icon = $button.find('.copy-icon');
            const $tooltip = $item.find('.copy-tooltip');

            function showCopiedFeedback() {
                const previousTimeout = $button.data('copy-timeout');
                if (previousTimeout) {
                    window.clearTimeout(previousTimeout);
                }
                $icon.text('✓');
                $tooltip.text('Copied to clipboard!').addClass('show');
                $button.data('copy-timeout', window.setTimeout(function () {
                    $icon.text('⧉');
                    $tooltip.removeClass('show');
                }, 2000));
                showToast('Copied to clipboard!', 'success');
            }

            const clipboardWrite = navigator.clipboard && navigator.clipboard.writeText
                ? Promise.resolve().then(function () {
                    return navigator.clipboard.writeText(value);
                }).catch(function () {
                    fallbackCopy(value);
                })
                : Promise.resolve().then(function () {
                    fallbackCopy(value);
                });

            clipboardWrite.then(showCopiedFeedback).catch(function () {
                showToast('Could not copy this text. Please select and copy it manually.', 'error');
            });
        });
    }

    // Task 9: Load images shortly before they enter the viewport
    function initLazyLoading() {
        const placeholder = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 9%22%3E%3Crect width=%2216%22 height=%229%22 fill=%22%23f4f5f8%22/%3E%3C/svg%3E';
        const $images = $('img.lazy');
        if (!$images.length) {
            return;
        }

        function unbindIfComplete() {
            if (!$('img.lazy').length) {
                $(window).off('scroll resize', loadVisibleImages);
                $(window).off('load', loadVisibleImages);
            }
        }

        function loadVisibleImages() {
            const viewportBottom = $(window).scrollTop() + $(window).height() + 200;
            $('img.lazy').each(function () {
                const $image = $(this);
                const source = $image.attr('data-src');
                if (!source || $image.offset().top >= viewportBottom) {
                    return;
                }

                $image.one('load', function () {
                    $image.removeClass('lazy').addClass('lazy-loaded');
                    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                        $image.css('opacity', 1);
                    } else {
                        $image.stop(true, true).fadeTo(180, 1);
                    }
                }).one('error', function () {
                    $image.removeClass('lazy').addClass('lazy-error')
                        .attr('src', placeholder)
                        .attr('title', 'Image could not be loaded');
                    unbindIfComplete();
                });
                $image.attr('src', source).removeAttr('data-src');
            });
            unbindIfComplete();
        }

        $('img.lazy').css('opacity', 0);
        $(window).on('scroll resize', loadVisibleImages);
        $(window).on('load', loadVisibleImages);
        loadVisibleImages();
    }

    initLiveSearch();
    initAutocomplete();
    initFaqSearch();
    initScrollProgress();
    initStatsCounter();
    initSubmitSpinners();
    initToastActions();
    initCopyButtons();
    initLazyLoading();
});
