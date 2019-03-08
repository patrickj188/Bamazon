let mysql = require('mysql');
let inquirer = require('inquirer');
let whatsTheMagicWord = require('./keys.js');
const chalk = require('chalk')

let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: whatsTheMagicWord,
    databse: 'bamazon'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId + "\n")
    inventory();

})

// this displays al the stores items
let inventory = () => {
    connection.query('SELECT * FROM bamazon.products', function (err, res) {
        if (err) throw err;

        for (let i = 0; i < res.length; i++) {
            console.log(chalk.cyan(`Item# -- ${res[i].item_id} \n`,
                `Product -- ${res[i].product_name}  \n`,
                `Department -- ${res[i].department_name} \n`,
                `Price -- $${res[i].price} \n`,
                `Stock -- ${res[i].stock_quantity} \n`,
                `------------------------------------------------ \x1b[1m`
            ))
        }
        purchaseItem();
    });
}


///This will prompt user to select an item from the store and purchase it 


let purchaseItem = () => {
    connection.query('SELECT * FROM bamazon.products', function (err, res) {
        inquirer
            .prompt([{
                type: 'input',
                name: 'item_id',
                message: "Pick an Item using the items ID",
                validate: validateInput,
                filter: Number
            },
            {
                type: 'input',
                name: 'quantity',
                message: 'How many items would you like to purchase?',
                validate: validateInput,
                filter: Number
            }])
            .then(function (answer) {

                connection.query('SELECT * FROM bamazon.products', function (err, res) {
                    let pickedItem;
                    for (let i = 0; i < res.length; i++) {
                        if (res[i].item_id === answer.item_id) {
                            pickedItem = res[i];
                        }
                    }
                    if (pickedItem.stock_quantity >= parseInt(answer.quantity)) {
                        function makePurchase(product, quantity) {
                            connection.query(
                                "UPDATE bamazon.products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
                                [quantity, product.item_id],
                                function (err, res) {
                                    // Let the user know the purchase was successful, re-run loadProducts
                                    console.log(chalk.green("Your total is $" + parseInt(answer.quantity) * pickedItem.price));
                                }
                            );
                        }
                        makePurchase(pickedItem, answer.quantity);
                    }
                    else {
                        console.log(chalk.red(`Sorry ${pickedItem.item_id} is not available at this time. You should have bought it sooner`));
                    }
                    continueShopping();
                })
            })
            .catch(function (err) {
                console.log('Catch an error: ', err);
            })
    })
}

function validateInput(value) {
    var integer = Number.isInteger(parseFloat(value));
    var sign = Math.sign(value);
    if (integer && (sign === 1)) {
        return true;
    } else {
        return 'Please enter a whole non-zero number.';
    }
}

function continueShopping() {
    inquirer.prompt([{
        type: "confirm",
        name: "reply",
        message: "Would you like to purchase another item?"
    }]).then(function (ans) {
        if (ans.reply) {
            purchaseItem();
        } else {
            console.log("Go on, get....");
            connection.end();
        }
    });
}




