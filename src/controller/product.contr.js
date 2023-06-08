import { JWT } from "../utils/jwt.js";
import Products from "../schemas/product.schema.js";
import Technologies from '../schemas/technology.schema.js'
import categoryArr from "../utils/categories.data.js";

const errorObj = (err) => {
  return {
    status: 400,
    message: `Error: ${err?.message}`,
    success: false,
  };
};

class ProductController {
  static async getProduct(req, res) {
    try {
      let { id } = req.params;
      let { category, technology } = req.query;
      let page = Number(req.query.page) || 1;
      let limit = Number(req.query.limit) || 10;
      let skip = (page - 1) * limit;
      console.log(req.query.search);
      let keyword = req.query.search
        ? {
            $or: [
              { name: { $regex: req.query.search, $options: "i" } },
              // { technology: { $regex: req.query.search, $options: "i" } },
              { price: { $regex: req.query.search, $options: "i" } },
              { desc: { $regex: req.query.search, $options: "i" } },
              { github_link: { $regex: req.query.search, $options: "i" } },
              { product_link: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      if (id) {
        let dataById = await Products.findById(id)
          .populate("user")
          .populate("technology");
        let others = await Products.find({ category: dataById.category });
        others = others.filter((el) => el._id != id);
        res
          .send({
            status: 200,
            message: `${id} - product`,
            success: true,
            data: { others, data: dataById },
          })
          .status(200);
      } else if (req.query?.search)   {
       
       // const results = await Products.find().populate('technology');
        // results.find({ technology: { $elemMatch: { name: req.query.search } } })
 
        //     // console.log(results);


        

      //   let AllTechnologies = await Products.find();
      //  let filterByName = AllTechnologies.filter(el=> el.name.toLowerCase().includes(req.query.search));
      //  console.log(filterByName);
        


      }

      //   .populate("user")
      //   .sort({ createdAt: -1 });
      // let filterTech = AllProduct.filter((element) => {
      //   let is = element.technology.map((el) => {
      //     if (el.name.includes(req.query.search)) {
      //       console.log(element);
      //       return element;
      //     }
      //   });
      //   return is;
      // });

      // if (filterTech.length) {
      //   res.send({
      //     status: 200,
      //     message: "Search Results",
      //     success: true,
      //     data: filterTech,
      //   });
      // } else {
      //   let products = await Products.find(keyword)
      //     .populate("user")
      //     .populate("technology")
      //     .sort({ createdAt: -1 });

      //   res.send({
      //     status: 200,
      //     message: "Search Results",
      //     success: true,
      //     data: products,
      //   });
      // }
      else if (category) {
        let findByCat = await Products.find({ category })
          .populate("user")
          .populate("technology")
          .sort({ createdAt: -1 });
        res.send(findByCat);
      } else if (technology) {
        let findByTech = await Products.find({ technology })
          .populate("user")
          .populate("technology")
          .sort({ createdAt: -1 });
        res.send(findByTech);
      } else {
        const products = await Products.find()
          .populate("user")
          .populate("technology")
          .skip(skip)
          .sort({ createdAt: -1 })
          .limit(limit * 1);
        res.send({
          status: 200,
          message: "Products",
          data: products,
          success: true,
        });
      }
    } catch (error) {
      res.send(errorObj(error));
    }
  }
  static async addProduct(req, res) {
    try {
      let { token } = req.headers;
      let { id } = JWT.VERIFY(token);
      let {
        name,
        technology,
        category,
        product_link,
        desc,
        price,
        github_link,
        phone,
      } = req.body;
      if (!name || !technology || !category || !product_link || !phone) {
        throw new Error("Data is incomplated! ❌");
      }
      if (!categoryArr.includes(category)) {
        throw new Error(`Invalid category!`);
      }
      let newProduct = await Products.create({
        name,
        technology,
        user: id,
        category,
        product_link,
        desc,
        price,
        github_link,
        phone_number: phone,
      });

      if (!newProduct) {
        throw new Error(`Product not added!`);
      }
      res.send({
        status: 200,
        message: "product added!",
        success: true,
        data: newProduct,
      });
    } catch (error) {
      res.send(errorObj(error));
    }
  }

  static async updateProduct(req, res) {
    // try {
    let { product_id } = req.params;
    let { token } = req.headers;
    let { id } = JWT.VERIFY(token);
    let findProductById = await Products.findById(product_id);
    if (findProductById.user != id) {
      throw new Error(`You can not update other people's product!`);
    }
    let {
      name,
      technology,
      category,
      product_link,
      desc,
      price,
      github_link,
      phone,
    } = req.body;
    if (
      !name &&
      !technology &&
      !category &&
      !product_link &&
      !desc &&
      !price &&
      !github_link &&
      !phone
    ) {
      throw new Error(`You have not send data!`);
    }
    let updatedProduct = await Products.findByIdAndUpdate(product_id, {
      name,
      technology,
      category,
      product_link,
      desc,
      price,
      github_link,
      phone,
    });
    res.send({
      status: 200,
      message: "Updated successfuly!",
      success: true,
      data: Products.findById(product_id),
    });
    // } catch (error) {
    //   res.send(errorObj(error));
    // }
  }

  static async deleteProduct(req, res) {
    try {
      let { product_id } = req.params;

      let { token } = req.headers;
      let { id } = JWT.VERIFY(token);
      let findProductById = await Products.findById(product_id);
      if (!findProductById) {
        throw new Error(`Not Found ${product_id} - product!`);
      }
      if (findProductById.user != id) {
        throw new Error(`You can not update other people's product!`);
      }
      let deleteProduct = await Products.findByIdAndDelete(product_id);
      if (!deleteProduct) {
        throw new Error(`The Product was not deleted!`);
      }
      res.send({
        status: 200,
        message: `Deleted ${product_id} - product`,
        success: true,
        data: deleteProduct,
      });
    } catch (error) {
      res.send(errorObj(error));
    }
  }
}

export default ProductController;

// let findProductById = await Products.findById('647a144ef322182a0d56ef40');

// console.log(findProductById);


// console.log(await Technologies.find());  