<?php

namespace xpbl4\dependent;

use yii\web\AssetBundle;

/**
 * Widget dependent asset bundle.
 */
class DependentAsset extends AssetBundle
{
	/**
	 * @var string Plugin language
	 */
	public $language;

	/**
	 * @inheritdoc
	 */
	public $sourcePath = '@xpbl4/dependent/assets';

	/**
	 * @inheritdoc
	 */
	public $js = [
		'js/dependent-dropdown.js'
	];

	/**
	 * @inheritdoc
	 */
	public $css = [
		'css/dependent-dropdown.css',
	];

	/**
	 * @inheritdoc
	 */
	public $depends = [
		'yii\web\JqueryAsset',
	];

	/**
	 * @inheritdoc
	 */
	public function registerAssetFiles($view)
	{
		if ($this->language !== null) {
			$this->js[] = 'js/i18n/'.$this->language.'.js';
		}

		parent::registerAssetFiles($view);
	}
}
