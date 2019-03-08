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
    managerView();

})


let managerView = () => {
    inquirer.prompt([{
        type: "list",
        name: "manager",
        message: "Welcome manager, what do you need to do?",
        choices: ["View Inventory", "View out of stock items", "Add Inventory", "Add new Inventory"]
    }]).then(function (answer) {
        switch (answer.manager) {
            case "View Inventory":
                inventory();
                break;

            case "View out of stock items":
                lowInventory();
                break;

            case "Add Inventory":
                addInventory();
                break;

            case "Add new Inventory":
                newInventory();
                break;
        }
    });


}


let inventory = () => {
    connection.query('SELECT * FROM bamazon.products', function (err, res) {
        if (err) throw err;
        // console.log("you made it");

        for (let i = 0; i < res.length; i++) {
            console.log(chalk.cyan(`Item# -- ${res[i].item_id} \n`,
                `Product -- ${res[i].product_name}  \n`,
                `Department -- ${res[i].department_name} \n`,
                `Price -- $${res[i].price} \n`,
                `Stock -- ${res[i].stock_quantity} \n`,
                `------------------------------------------------ \x1b[1m`
            ))
        }
        managerView();
    });
}

let newInventory = () => {
    let departments = [];

    connection.query('SELECT * FROM bamazon.products.department_name', function (res, err) {
        if (err) throw err;

        for (let i = 0; i < res.length; i++) {
            departments.push(res[i].department_name);
        }
    })

    inquirer.prompt([{
        type: 'input',
        name: 'product',
        message: 'Product Name: '
    },
    {
        type: 'list',
        name: 'departments',
        message: 'Department: ',
        choices: departments
    },
    {
        type: 'input',
        name: 'price',
        message: "Item Price: "
    },
    {
        type: "input",
        name: 'quantity',
        message: 'Item Quantity: '

    }

    ]).then(function (answer) {
        connection.query('INSERT INTO bamazon.products SET ?', {
            product_name: answer.product,
            department_name: answer.departments,
            price: answer.price,
            stock_quantity: answer.quantity
        },
            function (err, res) {
                if (err) throw err;
                console.log('Product was added to inventory')
            })
        managerView();
    })
}


let addInventory = () => {
    connection.query('SELECT * FROM bamazon.products', function (err,res) {
        if (err) throw err;

        let items = [];
        for (let i = 0; i < res.length; i++) {
            items.push(res[i].product_name);
        }
        console.log(items);
    })
    inquirer.prompt([{
        type: "input",
        name: 'product',
        message: 'What item would you like to add to?',
    },
    {
        type: 'input',
        name: 'quantity',
        message: 'How many new items would you like to add?'
    }
    ]).then(function (answer) {
        let currentQuantity;
        for (let i = 0; i < res.length; i++) {
            if (res[i].product_name === answer.product) {
                currentQuantity = res[i].stock_quantity;
            }
        }

        connection.query('UPDATE bamazon.products SET ? WHERE ?'[{
            stock_quantity: currentQuantity + parseInt(answer.quantity)
        }, {
                product_name: answer.product
            }],
            function (err) {
                if(err) throw err;
                console.log('The quantity was updated.');
            });

            managerView();
    })
}


