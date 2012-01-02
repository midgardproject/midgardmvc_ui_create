Web content editing tool for Midgard MVC
========================================

Important Installation Note
---------------------------

We just integrated the new [javascript framework](https://github.com/bergie/create)
to this component. This new JS framework is independent from Midgard MVC therefore
its structure is not the same as any MVC component.

You need to create a "static" directory in your local 'create' checkout and
copy or move the 'deps', 'src', and 'themes' directories there.

After this your application will not complain about missing files.

**Update**: the user interface (JavaScript) parts of Midgard Create have now been extracted to their own repository and are being refactored to be generic so that they can be used also outside Midgard context. See more in the [new Create repository](https://github.com/bergie/create)
