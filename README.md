Yii2 Dependent Dropdown widget
==============================
Dependent Dropdown widget allows to create dependent dropdown lists 

Installation
------------

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


Usage
-----

Once the extension is installed, simply use it in your code by  :

```php
<?= \xpbl4\dependent\Widget::widget(); ?>
<?= \xpbl4\dependent\Select2::widget(); ?>
<?= \xpbl4\dependent\DropDownList::widget(); ?>
<?= \xpbl4\dependent\DropDownMenu::widget(); ?>
```