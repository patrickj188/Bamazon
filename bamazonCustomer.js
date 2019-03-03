let mysql = require('mysql');
let inquirer = require('inquirer');
let whatsTheMagicWord = require('./keys.js');

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
            console.log(`\x1b[36m Item# -- ${res[i].item_id} \n`,
                `Product -- ${res[i].product_name}  \n`,
                `Department -- ${res[i].department_name} \n`,
                `Price -- $${res[i].price} \n`,
                `Stock -- ${res[i].stock_quantity} \n`,
                `------------------------------------------------ \x1b[36m `
            )
        }
        purchaseItem();
    });
}


///This will prompt user to select an item from the store and purchase it 


let purchaseItem = () => {
    connection.query('SELECT * FROM bamazon.products', function (err, res) {
        inquirer
            .prompt([{
                name: 'item_id',
                type: 'input',
                message: "Pick an Item using the items ID",
                // validate: validateInput,
                // filter: Number
            },
            {
                name: 'quantity',
                type: 'input',
                message: 'How many items would you like to purchase?',
                // validate: validateInput,
                // filter: Number
            }])
            .then(function (answer) {

                connection.query('SELECT * FROM bamazon.products', function (err, res) {
                    let pickedItem;

                    for (let i = 0; i < res.lenght; i++) {
                        if (res[i].item_id === answer.item_id) {
                            pickedItem = res[i];
                            return pickedItem;
                        }
                    }

                    if (pickedItem.stock_quantity > parseInt(answer.quantity)) {
                        connection.query('UPDATE products SET ? WHERE ?'[
                            {
                                stock_quantity: (chosenItem.stock_quantity - parseInt(answer.quantity))
                            },
                            {
                                item_id: pickedItem.item_id
                            }
                        ],
                            function (err) {
                                if (err) throw err;
                                console.log("\x1b[32m Your total is $" + parseInt(answer.quantity) * pickedItem.price)
                            }
                        );

                    }
                    else {
                        console.log(`\x1b[31m Sorry ${pickedItem.item_id} is not available at this time. You should have bought it sooner`);
                    }

                })
            })
    })
}





