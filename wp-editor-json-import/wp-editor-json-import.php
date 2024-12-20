<?php
/**
 * Plugin Name: WP Editor JSON Import.
 * Description: Import Block JSON data into the WordPress editor.
 * Requires at least: 6.0
 * Tested up to: 7.4
 * Network: true
 * Plugin URI: https://gutenverse.com/
 * Author: Jegstudio
 * Version: 1.0.0
 * Author URI: https://jegtheme.com/
 * License: GPLv3
 * Text Domain: gutenverse
 *
 * @package weji
 */
function weji_enqueue_editor_styles() {
	$plugin_url = plugins_url( 'wp-editor-json-import' );
	wp_enqueue_style( 'editor-style', $plugin_url . '/assets/css/editor.css', array(), '1.0.0' );

	$plugin_path = plugin_dir_path( __FILE__ );
	$include     = ( include $plugin_path . '/lib/editor.asset.php' )['dependencies'];
	wp_enqueue_script( 'editor-script', $plugin_url . '/assets/js/editor.js', $include, '1.0', true );
}

add_action( 'admin_init', 'weji_enqueue_editor_styles' );

/**
 * Print Root.
 */
function weji_register_root() {
	?>
	<div id='weji-root'></div><div id='weji-error'></div>
	<?php
}

add_action( 'admin_footer', 'weji_register_root' );
