<?php

namespace xpbl4\dependent;

use Yii;
use yii\base\InvalidConfigException;
use yii\bootstrap\Html;
use yii\helpers\ArrayHelper;
use yii\helpers\Json;
use yii\web\JsExpression;

/**
 * Dependent Dropdown widget
 * @var \yii\base\Widget $this Widget
 *
 * Usage:
 * ~~~
 * echo $form->field($model, 'field')->widget(\xpbl4\dependent\Dropdown::className(), [
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
 *         'dependent:open' => 'function (e) { log("dependent:dependent", e); }',
 *         'dependent:close' => new JsExpression('function (e) { log("dependent:close", e); }')
 *         'dependent:select' => [
 *             'function (e) { log("dependent:select", e); }',
 *             'function (e) { console.log(e); }'
 *         ]
 *         ...
 *     ]
 * ]);
 * ~~~
 */

class Dropdown extends \yii\widgets\InputWidget
{
	/** Name of inline JavaScript package that is registered by the widget */
	const INLINE_JS_KEY = 'xpbl4/dependent/';

	/**
	 * @var array {@link https://select2.org/configuration/options-api Select2} options
	 */
	public $pluginOptions = [];

	/**
	 * @var array Select items
	 */
	public $items = [];

	/**
	 * @var string Plugin language. If `null`, [[\yii\base\Application::language|app language]] will be used.
	 */
	public $language;

	/**
	 * Events array. Array keys are the events name, and array values are the events callbacks.
	 * Example:
	 * ```php
	 * [
	 *     'dependent:open' => 'function (e) { log("dependent:open", e); }',
	 *     'dependent:close' => new JsExpression('function (e) { log("dependent:close", e); }'),
	 *     'dependent:select' => [
	 *         'function (e) { log("dependent:select", e); }',
	 *         'function (e) { console.log(e); }'
	 *     ]
	 * ]
	 * ```
	 * @var array Plugin events
	 */
	public $pluginEvents = [];

	/**
	 * @inheritdoc
	 */
	public function init()
	{
		parent::init();

		if (empty($this->pluginOptions['url']) && empty($this->pluginOptions['data'])) {
			throw new InvalidConfigException("Either 'url', or 'data' plugin options must be specified.");
		}

		// Set language
		if ($this->language === null && ($language = Yii::$app->language) !== 'en-US') {
			$this->language = substr($language, 0, 2);
		}

		// Set placeholder
		$_placeholder = ArrayHelper::remove($this->options, 'prompt');
		if (!is_null($_placeholder) && !key_exists('allowClear', $this->pluginOptions)) $this->pluginOptions['allowClear'] = true;

		$_placeholder = ArrayHelper::remove($this->options, 'placeholder', $_placeholder);
		$_placeholder = ArrayHelper::remove($this->pluginOptions, 'placeholder', $_placeholder);

		if ($_placeholder === true && $this->hasModel()) $_placeholder = $this->model->getAttributeLabel($this->attribute);
		if (!is_null($_placeholder)) {
			$this->pluginOptions['placeholder'] = $_placeholder;
			if (empty($this->options['multiple'])) $this->options['prompt'] = $_placeholder;
		}
	}

	/**
	 * @inheritdoc
	 */
	public function run()
	{
		$this->registerClientScript();
		if ($this->hasModel()) {
			return Html::activeDropDownList($this->model, $this->attribute, $this->items, $this->options);
		} else {
			return Html::dropDownList($this->name, $this->value, $this->items, $this->options);
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
		$asset = DependentAsset::register($view);

		if ($this->language !== null) {
			$asset->language = $this->language;
			$this->pluginOptions['language'] = $this->language;
		}

		//DependentWidgetAsset::register($view);

		// Init widget
		$settings = Json::encode($this->pluginOptions);
		$view->registerJs("jQuery('$selector').dependent($settings);", $view::POS_READY, self::INLINE_JS_KEY.$this->options['id']);

		// Register events
		$this->registerEvents();
	}

	/**
	 * Register plugin' events.
	 */
	protected function registerEvents()
	{
		$view = $this->getView();
		$selector = '#'.$this->options['id'];

		if (!empty($this->pluginEvents)) {
			$js = [];
			foreach ($this->pluginEvents as $event => $callback) {
				if (is_array($callback)) {
					foreach ($callback as $function) {
						if (!$function instanceof JsExpression) {
							$function = new JsExpression($function);
						}
						$js[] = "jQuery('$selector').on('$event', $function);";
					}
				} else {
					if (!$callback instanceof JsExpression) {
						$callback = new JsExpression($callback);
					}
					$js[] = "jQuery('$selector').on('$event', $callback);";
				}
			}
			if (!empty($js)) {
				$js = implode("\n", $js);
				$view->registerJs($js, $view::POS_READY, self::INLINE_JS_KEY.'events/'.$this->options['id']);
			}
		}
	}

	public static function field($model, $attribute, $options)
	{
		return self::widget(ArrayHelper::merge(['model' => $model, 'attribute' => $attribute], $options));
	}
}