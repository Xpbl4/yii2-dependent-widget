<?php

namespace xpbl4\dependent;

use yii\base\InvalidConfigException;
use yii\helpers\ArrayHelper;
use yii\helpers\Json;

/**
 * Dependent Dropdown widget
 * @var \yii\base\Widget $this Widget
 *
 * Usage:
 * ~~~
 * echo $form->field($model, 'field')->widget(\xpbl4\dependent\Select2::className(), [
 *     'items' => [
 *         'item1',
 *         'item2',
 *         ...
 *     ],
 *     'options' => [
 *         'multiple' => true,
 *         'placeholder' => 'Choose item'
 *     ],
 *     'pluginOptions' => [
 *         'width' => '100%',
 *     ],
 *     'pluginEvents' => [
 *         'dependent:open' => 'function (e) { log("dependent:open", e); }',
 *         'dependent:close' => new JsExpression('function (e) { log("dependent:close", e); }')
 *         'dependent:select' => [
 *             'function (e) { log("dependent:select", e); }',
 *             'function (e) { console.log(e); }'
 *         ]
 *         ...
 *         'select2:open' => 'function (e) { log("select2:open", e); }',
 *         'select2:close' => new JsExpression('function (e) { log("select2:close", e); }')
 *         ...
 *     ],
 *     'select2Options' => [
 * 	       'allowClear' => true,
 * 	       'closeOnSelect' => false,
 * 	       ...
 * 	   ]
 * ]);
 * ~~~
 */
class Select2 extends \xpbl4\dependent\Dropdown
{
	/** Name of inline JavaScript package that is registered by the widget */
	const INLINE_JS_KEY = 'xpbl4/dependent/';

	/**
	 * @var array {@link https://select2.org/configuration/options-api Select2} options
	 */
	public $select2Options = [];

	/**
	 * @inheritdoc
	 */
	public function init()
	{
		if (!class_exists('xpbl4\select2\Select2'))
			throw new InvalidConfigException("The 'xpbl4\select2\Select2' widget should must be installed.");

		parent::init();

		// Set placeholder
		$_placeholder = ArrayHelper::remove($this->options, 'prompt');
		if (!is_null($_placeholder) && !key_exists('allowClear', $this->select2Options)) $this->select2Options['allowClear'] = true;

		$_placeholder = ArrayHelper::remove($this->options, 'placeholder', $_placeholder);
		$_placeholder = ArrayHelper::remove($this->select2Options, 'placeholder', $_placeholder);

		if ($_placeholder === true && $this->hasModel()) $_placeholder = $this->model->getAttributeLabel($this->attribute);
		if (!is_null($_placeholder)) {
			$this->select2Options['placeholder'] = $_placeholder;
			if (empty($this->options['multiple'])) $this->options['prompt'] = $_placeholder;
		}
	}

	/**
	 * Register widget asset.
	 */
	public function registerClientScript()
	{
		$view = $this->getView();
		$selector = '#'.$this->options['id'];

		// Register asset
		$asset = \xpbl4\select2\Select2Asset::register($view);

		if ($this->language !== null) {
			$asset->language = $this->language;
			$this->select2Options['language'] = $this->language;
		}

		\xpbl4\select2\Select2WidgetAsset::register($view);

		$this->pluginOptions['plugin'] = 'select2';
		$this->pluginOptions['pluginOptions'] = ArrayHelper::merge($this->select2Options, [
			'items' => $this->items,
			'options' => $this->options,
		]);

		// Init widget
		$settings = Json::encode($this->pluginOptions['pluginOptions']);
		$view->registerJs("jQuery('$selector').select2($settings);", $view::POS_READY, self::INLINE_JS_KEY.'select2/'.$this->options['id']);

		parent::registerClientScript();
	}
}