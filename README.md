# Yii2 Dependent Dropdown widget

[![Latest Version](https://img.shields.io/github/tag/Xpbl4/yii2-dependent-widget.svg?style=flat-square&label=release)](https://github.com/Xpbl4/yii2-dependent-widget/releases)
[![Software License](https://img.shields.io/badge/license-BSD-brightgreen.svg?style=flat-square)](LICENSE.md)
[![Total Downloads](https://img.shields.io/packagist/dt/Xpbl4/yii2-dependent-widget.svg?style=flat-square)](https://packagist.org/packages/Xpbl4/yii2-dependent-widget)

Dependent Dropdown widget allows to create dependent dropdown lists 

## Installation

The preferred way to install this extension is through [composer](http://getcomposer.org/download/).

Either run

```
php composer.phar require --prefer-dist xpbl4/yii2-dependent-widget "*"
```

or add

```
"xpbl4/yii2-dependent-widget": "*"
```

to the require section of your `composer.json` file.

## Usage

Once the extension is installed, simply use it in your code by:

```php
<?= Html::dropDownList('depend_field', '', ['first', 'second', 'third']); ?>
<?= \xpbl4\dependent\Dropdown::widget([
    'id' => 'exampleInput',
    'name' => 'test',
    'items' => ['one', 'two', 'three'],
    'options' => ['class' => 'form-control', 'prompt' => 'Select item...'],
    'pluginOptions' => [
        'url' => \yii\helpers\Url::toRoute(), /* return [items...] */
        'initialize' => true,
        'depends' => [
            'depend_id' => 'depend_field',
        ],
        'ajaxOptions' => [
            'delay' => 500
        ],
        'pagination' => [
            'limit' => 10
        ],
    ],
    'pluginEvents' => [
        'dependent:init' => new \yii\web\JsExpression('consoleEvent'),
        'dependent:change' => new \yii\web\JsExpression('consoleEvent'),
        'dependent:focus' => new \yii\web\JsExpression('consoleEvent'),
        'dependent:beforeSend' => new \yii\web\JsExpression('consoleEvent'),
        'dependent:success' => new \yii\web\JsExpression('consoleEvent'),
        'dependent:error' => new \yii\web\JsExpression('consoleEvent'),
        'dependent:afterChange' => new \yii\web\JsExpression('consoleEvent'),

    ]
]); ?>

<?= \xpbl4\dependent\Select2::widget([
    'id' => 'exampleInput',
    'name' => 'test',
    'items' => ['one', 'two', 'three'],
    'options' => ['class' => 'form-control', 'prompt' => 'Select item...'],
    'pluginOptions' => [
        'url' => \yii\helpers\Url::toRoute(), /* return [items...] */
        'initialize' => true,
        'depends' => [
            'depend_id' => 'depend_field',
        ],
        'ajaxOptions' => [
            'delay' => 500
        ],
        'pagination' => [
            'limit' => 10
        ],
    ],
    'pluginEvents' => [
        'dependent:init' => new \yii\web\JsExpression('consoleEvent'),
        'dependent:change' => new \yii\web\JsExpression('consoleEvent'),
        ...

        'select2:open' => 'function (e) { log("select2:open", e); }',
        'select2:close' => new JsExpression('function (e) { log("select2:close", e); }')
        ...
    ],
    'select2Options' => [
        'allowClear' => true,
        'closeOnSelect' => false,
        ... /* Options for Select2 plugin */
    ]
]); ?>
```