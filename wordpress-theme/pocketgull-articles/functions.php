<?php
/**
 * Pocket-Gull Articles Theme Functions & Definitions
 *
 * @package PocketGull_Articles
 * @version 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Setup theme defaults and registers support for various WordPress features.
 */
function pocketgull_theme_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
    add_theme_support( 'align-wide' );
    add_theme_support( 'editor-styles' );
    add_editor_style( 'style.css' );

    // Register navigation menus
    register_nav_menus( array(
        'primary' => __( 'Primary Navigation', 'pocketgull-articles' ),
        'footer'  => __( 'Footer Navigation', 'pocketgull-articles' ),
    ) );
}
add_action( 'after_setup_theme', 'pocketgull_theme_setup' );

/**
 * Enqueue scripts and styles.
 */
function pocketgull_enqueue_scripts() {
    // Tailwind CDN / CSS & Caslon Typography
    wp_enqueue_style( 'google-fonts-caslon', 'https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap', array(), null );
    wp_enqueue_style( 'tailwind-cdn', 'https://cdn.tailwindcss.com', array(), null );
    wp_enqueue_style( 'pocketgull-style', get_stylesheet_uri(), array(), '1.0.0' );
}
add_action( 'wp_enqueue_scripts', 'pocketgull_enqueue_scripts' );

/**
 * Register SNO-10 Custom Taxonomy (SNOMED-CT / ICD-10 Crosswalks)
 */
function pocketgull_register_taxonomies() {
    $labels = array(
        'name'              => _x( 'SNO-10 Clinical Conditions', 'taxonomy general name', 'pocketgull-articles' ),
        'singular_name'     => _x( 'SNO-10 Condition', 'taxonomy singular name', 'pocketgull-articles' ),
        'search_items'      => __( 'Search Conditions', 'pocketgull-articles' ),
        'all_items'         => __( 'All Conditions', 'pocketgull-articles' ),
        'edit_item'         => __( 'Edit Condition', 'pocketgull-articles' ),
        'update_item'       => __( 'Update Condition', 'pocketgull-articles' ),
        'add_new_item'      => __( 'Add New Condition (e.g. I10 / SNOMED 38341003)', 'pocketgull-articles' ),
        'new_item_name'     => __( 'New Condition Name', 'pocketgull-articles' ),
        'menu_name'         => __( 'SNO-10 Conditions', 'pocketgull-articles' ),
    );

    $args = array(
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'condition' ),
        'show_in_rest'      => true, // Enables REST API & Block Editor access
    );

    register_taxonomy( 'sno10_condition', array( 'post' ), $args );
}
add_action( 'init', 'pocketgull_register_taxonomies' );

/**
 * Calculate Estimated Reading Time
 */
function pocketgull_get_reading_time( $post_id = null ) {
    $content = get_post_field( 'post_content', $post_id );
    $word_count = str_word_count( strip_tags( $content ) );
    $minutes = ceil( $word_count / 200 ); // 200 words per minute
    return max( 1, $minutes );
}

/**
 * Expose custom REST API fields for Pocket-Gull Angular client consumption
 */
function pocketgull_register_rest_fields() {
    register_rest_field( 'post', 'reading_time_minutes', array(
        'get_callback' => function( $post_arr ) {
            return pocketgull_get_reading_time( $post_arr['id'] );
        },
        'schema' => array(
            'description' => 'Estimated reading time in minutes',
            'type'        => 'integer',
        ),
    ) );
}
add_action( 'rest_api_init', 'pocketgull_register_rest_fields' );
