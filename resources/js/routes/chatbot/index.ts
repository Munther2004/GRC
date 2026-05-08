import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ComplianceChatbotController::index
* @see app/Http/Controllers/ComplianceChatbotController.php:135
* @route '/chatbot'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/chatbot',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ComplianceChatbotController::index
* @see app/Http/Controllers/ComplianceChatbotController.php:135
* @route '/chatbot'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ComplianceChatbotController::index
* @see app/Http/Controllers/ComplianceChatbotController.php:135
* @route '/chatbot'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ComplianceChatbotController::index
* @see app/Http/Controllers/ComplianceChatbotController.php:135
* @route '/chatbot'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ComplianceChatbotController::index
* @see app/Http/Controllers/ComplianceChatbotController.php:135
* @route '/chatbot'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ComplianceChatbotController::index
* @see app/Http/Controllers/ComplianceChatbotController.php:135
* @route '/chatbot'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ComplianceChatbotController::index
* @see app/Http/Controllers/ComplianceChatbotController.php:135
* @route '/chatbot'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\ComplianceChatbotController::chat
* @see app/Http/Controllers/ComplianceChatbotController.php:144
* @route '/chatbot/chat'
*/
export const chat = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat.url(options),
    method: 'post',
})

chat.definition = {
    methods: ["post"],
    url: '/chatbot/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ComplianceChatbotController::chat
* @see app/Http/Controllers/ComplianceChatbotController.php:144
* @route '/chatbot/chat'
*/
chat.url = (options?: RouteQueryOptions) => {
    return chat.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ComplianceChatbotController::chat
* @see app/Http/Controllers/ComplianceChatbotController.php:144
* @route '/chatbot/chat'
*/
chat.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ComplianceChatbotController::chat
* @see app/Http/Controllers/ComplianceChatbotController.php:144
* @route '/chatbot/chat'
*/
const chatForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: chat.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ComplianceChatbotController::chat
* @see app/Http/Controllers/ComplianceChatbotController.php:144
* @route '/chatbot/chat'
*/
chatForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: chat.url(options),
    method: 'post',
})

chat.form = chatForm

const chatbot = {
    index: Object.assign(index, index),
    chat: Object.assign(chat, chat),
}

export default chatbot